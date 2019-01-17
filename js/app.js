/**@SOFTDromedicas*/
//Formato para el valor de la recarga
(function($, undefined) {

	"use strict";

	// When ready.
	$(function() {
		
        var $form = $("#form");
        var $input = $form.find("#valor-recarga");

        $input.on("keyup", function(event) {
			
			
			// When user select text in the document, also abort.
			var selection = window.getSelection().toString();
			if ( selection !== '' ) {
				return;
			}
			
			// When the arrow keys are pressed, abort.
			if ( $.inArray( event.keyCode, [38,40,37,39] ) !== -1 ) {
				return;
			}
			
			
			var $this = $( this );
			
			// Get the value.
			var input = $this.val();
			
			var input = input.replace(/[\D\s\._\-]+/g, "");
					input = input ? parseInt( input, 10 ) : 0;

					$this.val( function() {
						return ( input === 0 ) ? "" : input.toLocaleString( "en-US" );
					} );
		} );
		
		/**
		 * ==================================
		 * When Form Submitted
		 * ==================================
		 */
		$form.on( "submit", function( event ) {
			
			var $this = $( this );
			var arr = $this.serializeArray();
		
			for (var i = 0; i < arr.length; i++) {
					arr[i].value = arr[i].value.replace(/[($)\s\._\-]+/g, ''); // Sanitize the values.
			};
			
			
			
			event.preventDefault();
		});
		
	});
})(jQuery);


var valorRecarga; 	//almacena el valor a recargas
var numeroCelular;	//almacena el nro a recargas
var operador;				//codigo del operador
var codVendedor;		//codigo del vendedor
var pinRecarga;			//codigo personal del vendedor para recargas
var vendedoresList; // coleccion de todos los vendedores con su pin de recarga


var operadoresService = "http://dromedicas.sytes.net:8082/dropos/wsjson/operadores/";
var mensajerossService = "http://dromedicas.sytes.net:8082/dropos/wsjson/vendedores/";
var recarcaService = "http://dromedicas.sytes.net:8082/dropos/recargasservice.php?";

var valorValido = true, numeroValido = true, vendedorValido = true, pinValido = true;
var activeSession = false;

var onBlurSubmit = false; //variable de control para borrar alertas de errores
var intervalo = null;
var recargaError ;

var cargaCompleta = false;


var peticion = 0;

//valida que la sesion este activa al cargar la pagina x 1ra vez
function validacion() {
    console.log("%cMade for %cDromedicas del Oriente  %c(specially this project)",       
        "background-color: #FFFFFF; color: #00612E",
        "background-color: #FFFFFF; color: #000a7b",
        "background-color: #FFFFFF; color: #AE000C");

    console.log("%cVisit us! %chttp:www.dromedicas.com.co",
        "background-color: #FFFFFF; color: #000",
        "background-color: #FFFFFF; color: #008ce2");
    var urlLocal = recarcaService;
    urlLocal += "opcion=obtenersesion"
    /*$.ajax({
            url: urlLocal,
        })
        .done(function(res) {
            activeSession = res;
            iniciar();
            
        })
        .fail(function(xhr, status, error) {
            mostrarFallaDelSistema(xhr.responseText);
            var btnError = document.getElementById("btn-error");

            btnError.addEventListener("click", function(e) {
                window.close();
            }, false);
        });*/
}
//valida que la sesion este activa mientras la pagina este abierta
function validacionInterval() {
	var urlLocal = recarcaService;
	urlLocal += "opcion=obtenersesion"
    $.ajax({
            url: urlLocal,
        })
        .done(function(res) {
            activeSession = res;    
            if (activeSession === "IN") {  
            	// console.log("[DEBUG "+ new Date() +"] Session Valida")          	
            }else{    
            	// console.log("[DEBUG "+ new Date() +"] Session INValida")        	
                clearInterval(intervalo);
                intervalo = null;
                document.getElementById("sinconexion").classList.add("active");
            }
        })
        .fail(function(err) {
            mostrarFallaDelSistema(err);
        });
}

//Registra eventos para los componentes de interfaz
function iniciar() {	
	console.log("SOFTDromedicas");
		$("#mensaje-inicio").show();
    //algunos eventos que se deben cargar siempre
    var btnSinConex = document.getElementById("btn-sinconexion");
    var btnError = document.getElementById("btn-error");
    btnSinConex.addEventListener("click", function(e) {
        window.close();
    }, false);
    btnError.addEventListener("click", function(e) {
        window.close();
    }, false);
    var btnEnviar = document.getElementById("enviar");
    btnEnviar.addEventListener("click", procesarRecarga, false);

    //da foco en el campo valor
    document.getElementById("valor-recarga").focus();

    if (activeSession === "IN") {
        //registro de manejadores de eventos para los botones de los callout
        var btnOkAlerta = document.getElementById("okalerta");
        var btnWarning = document.getElementById("okwarning");
        var btnSucess = document.getElementById("oksucess");

        btnOkAlerta.addEventListener("click", function(e) {
            e.target.parentNode.parentNode.classList.remove("active");
            document.getElementById('form').classList.remove('blur');
            document.getElementById('form').classList.add('nonBlur');
        }, false);
        btnWarning.addEventListener("click", function(e) {
            e.target.parentNode.parentNode.classList.remove("active");
            document.getElementById('form').classList.remove('blur');
            document.getElementById('form').classList.add('nonBlur');
        }, false);
        btnSucess.addEventListener("click", function(e) {
            e.target.parentNode.parentNode.classList.remove("active");
        }, false);
        //recibe codigo de vendedor y pin de recarga en un arreglo desde un servicio
        getPinesRecarga();
        
        //recibe los datos datos de operadores desde un servicio
        getOperadores();

        //registro de eventos para el combo de operador
        document.getElementById('operador').addEventListener('change',function(ev){renderedNumeroAbonado(ev)}, false);

        //valida que este vigente la session
        intervalo = window.setInterval("validacionInterval()", 420000)
    } else {
        //En caso de no haber una sesion bloquea la interfaz
        document.getElementById("sinconexion").classList.add("active");
    }
}



//Obtiene desde un servicio los operadores de telefonia celular
function getOperadores(){
	try{
		var xhr = new XMLHttpRequest()
		xhr.addEventListener("readystatechange", function(){creandoComboOperador(xhr);}, false);
		xhr.open( "GET", operadoresService, true );
 		xhr.setRequestHeader("Accept",
 					"application/json; charset=utf-8" );
 		xhr.send(); 		
	}catch(ex){
		mostrarFallaDelSistema(ex.message);
	}
}

//Crea el combobox de operadores, metodo auxiliar del metodo getOperadores
function creandoComboOperador(xhr) {
    if (xhr.readyState == 4 && xhr.status == 200) {
        var data = JSON.parse(xhr.responseText);
        var operSelect = document.getElementById("operador");
        var operadoresList = data.data;
        for (var i = 0; i < operadoresList.length; i++) {
            var option = document.createElement("option");
            option.setAttribute("value", operadoresList[i].codoperador);
            option.appendChild(document.createTextNode(operadoresList[i].nomoperador));
            operSelect.appendChild(option);
        }
        //oculta el mensaje de inicio de la carga
        $("#mensaje-inicio").fadeOut(4000);
    } else {
        if (xhr.status == 404) {
			mostrarFallaDelSistema("Error 404 para Operador");            
        } 
    }
}

//Obtiene los pines de los vendedores por medio de un servicio
function getPinesRecarga(){
	try{
		var xhr = new XMLHttpRequest()
		xhr.addEventListener("readystatechange", function(){parseDataMensajeros(xhr);}, false);
		xhr.open( "GET", mensajerossService, true );
 		xhr.setRequestHeader("Accept",
 					"application/json; charset=utf-8" );
 		xhr.send(); 		
	}catch(ex){
		mostrarFallaDelSistema(ex.message);
	}
}

//Medoto Auxiliar de getPinesRecarga
function parseDataMensajeros(xhr) {
	if (xhr.readyState == 4 && xhr.status == 200) {
		var data = JSON.parse(xhr.responseText);	
		vendedoresList = data.data;			
		cargaCompleta =  true;
	} else {
		if (xhr.status == 404) {
			mostrarFallaDelSistema("Error 404 para Pines");            
      } 	
	}
}

//Cambia los iconos y el label para la fila de Numero Celular
function renderedNumeroAbonado(ev){
	var operElegido =  ev.target.value;

	if( operElegido == 400 ){
		//Aca hago la renderizacion de los componentes de interfaz
		console.log("DirectTv");
		document.getElementById('label-nrocelular').innerHTML ="N&uacute;mero decodificador DIRECTV" ;
		document.getElementById('iconmobile').classList.remove('icon-mobile');
		document.getElementById('iconmobile').classList.add('icona-directv');
		document.getElementById('numero-celular').placeholder ="Ingrese el numero del decodificador";

	}else{
		//Reestablezo los componentes para recargas
		console.log(operElegido);
		document.getElementById('label-nrocelular').innerHTML ="N&uacute;mero Celular" ;
		document.getElementById('iconmobile').classList.remove('icona-directv');
		document.getElementById('iconmobile').classList.add('icon-mobile');
		document.getElementById('numero-celular').placeholder ="Ingrese el numero celular";
	}	
}



/*
 * Procesa la Recarga ¯
 * 	----> ----> 				
 */
function procesarRecarga() {
		document.getElementById("enviar").disabled = true;;
    onBlurSubmit = true;
    // obtiene los datos del formulario 
    valorRecarga = document.getElementById("valor-recarga");
    numeroCelular = document.getElementById("numero-celular");
    var comboOperador = document.getElementById("operador");
    voperador = comboOperador.options[comboOperador.selectedIndex].value;
    codVendedor = document.getElementById("codigo-vendedor");
    pinRecarga = document.getElementById("pin-vendedor");
   	

    // se envian los datos al servidor y se muestra el spinner
    if (validarFormulario()) {
        var urlLocal = "";
        var numCel = numeroCelular.value;
        urlLocal = recarcaService;
        urlLocal += "opcion=procesarrecarga&";
        urlLocal += "codoperador" + "=" + voperador + "&" + "codvende" + "=" + codVendedor.value + "&" +
            "numrecarga" + "=" + numCel + "&" + "pinrecargas" + "=" + pinRecarga.value + "&" +
            "valor" + "=" + valorRecarga.value.replace(",", "");
        console.log("Peticion " + ++peticion );
        try {
            var xhr = new XMLHttpRequest()
            xhr.addEventListener("readystatechange", function() {
                stateChange(xhr);
            }, false);
            xhr.open("GET", urlLocal, true);
            //esta variable espera un maximo de 30 seg. para la peticion
            xhr.timeout = 40000;
            //terminado el tiempo aborta la peticion y valida si quedo aplicada, 
            //sino quedo aplicacada muestra un aviso de error
            xhr.ontimeout = function(e) {
                //aborta la peticion ajax
                spinner.classList.remove("active");
                xhr.abort();
                console.log("aborte la peticion");
                //hace la revalidacion de  la recarga  
                validarRecarga(function(result) {
                    if (result) {
                        validarRespuesta("01");
                        limpiarCamposFormulario();
                    } else {
                        mostrarFallaDelSistema("NO hay respuesta del servidor intentelo de nuevo.");
                    }
                });
            }
            xhr.send();
        } catch (ex) {
        		mostrarFallaDelSistema(ex.message);
        }
    } else {}
}


//manejo los estados del objeto Ajax
function stateChange(xhr){
	var spinner = document.getElementById("spinner");
	if(xhr.readyState >= 1 &&	xhr.readyState <= 3 ){
		spinner.classList.add("active");	
		document.getElementById("form").classList.remove("nonBlur");
		document.getElementById("form").classList.add("blur");
	}
	if (xhr.readyState == 4 && xhr.status == 200) {
		spinner.classList.remove("active");			
		console.log("Respuesta:" + xhr.responseText);
		try{
		  var respuesta = JSON.parse(xhr.responseText)	
			console.log( ">|"+respuesta.status + "|" + respuesta.message +"|" );
			//llamada a metodo validar respuesta para desplegar el callout correspondiente
			validarRespuesta( respuesta.status , respuesta.message );				
		}catch(ex){
			if(ex.message === "Unexpected end of JSON input"){
				mostrarFallaDelSistema("Falla en la respuesta del servicio." + ex);
			}else{
				mostrarFallaDelSistema("Falla en la respuesta del servicio." + ex);
			}
		}
	} else {
		if (xhr.status == 404) {
			mostrarFallaDelSistema("Error 404 para Pines");            
    } 	
	}
}


//funcion que valida los la respuestas del servicio y despliega
//los mensajes correspondientes
function validarRespuesta(respuesta, mensaje){
		switch(respuesta){
			case'00'://recarga exitosa
				var divOk = document.getElementById("menasaje-ok");
    		divOk.classList.add("active");
    		//llamada a funcion para limpiar logs campos del formulario si la respuesta es correcta
				limpiarCamposFormulario();   		
				document.getElementById("form").classList.remove("blur");
				document.getElementById("form").classList.add("nonBlur");
				document.getElementById("enviar").disabled = false;
				break;
			case '20':
			  document.getElementById("form").classList.remove("nonBlur");
			  document.getElementById("form").classList.add("blur");
				var divAlerta = document.getElementById("mensaje-alerta");
    		divAlerta.classList.add("active");
    		document.getElementById("mensajeAlerta-ppal").innerHTML = mensaje;
    		document.getElementById("mensajeAlerta-secundario").innerHTML = 
    					"Verifique que el operador corresponda a ese n&uacute;mero.";
    		document.getElementById("enviar").disabled = false;
				break;
			case'03':
				mostrarCallout("tipoCallout", "MensajeCallout");
				break;
			case'50'://operador bloqueado
				document.getElementById("form").classList.remove("nonBlur");
			  document.getElementById("form").classList.add("blur");
				var divError = document.getElementById("mensaje-error");
    		divError.classList.add("active");
    		document.getElementById("mensajeError-ppal").innerHTML = mensaje;
    		document.getElementById("mensajeError-secundario").innerHTML = 
    					"No se permiten recargas de este operador.";
				break;
			case'':
				document.getElementById("form").classList.remove("nonBlur");
			  document.getElementById("form").classList.add("blur");
				var divOk = document.getElementById("error-sistema");
    		divOk.classList.add("active");
    		document.getElementById("mesaje-falla").innerHTML = "Falla General - No hay respuesta del servidor";
    		document.getElementById("mesaje-falla-secundario").innerHTML = 
    					"Intente nuevamente, si persiste la falla contacte al administrador del Sistema.";
				break;
			default:
			  console.log("ingrese al default");
			  document.getElementById("form").classList.remove("blur");
			  document.getElementById("form").classList.add("nonBlur");
			  limpiarCamposFormulario();
    		var divOk = document.getElementById("mensaje-error");
    		divOk.classList.add("active");
    		document.getElementById("mensajeError-ppal").innerHTML = "Falla en la recarga";  
    		document.getElementById("mensajeError-secundario").innerHTML = 
    														"Error general de la recarga. Si persiste la falla consulte al administrador del sistema.";  

    	 break;


		}//fin del switch
}


//metodo predicado que valida todos los campos del formulario
//Condiciones recargas celular:
// - El valor de la recarga debe ser multiplo de 1.000
// - El numero de celular debe ser minimo de 10 digitos
// - El codigo de vendedor se compara con el pin o autorizacion de recarga
// - El codigo de recarga se compara con el codigo de vendedor
// 
// Condiciones recarga directv:
function validarFormulario(){	
	
	var valido = true ;
	var valRecargaTemp = valorRecarga.value.replace(",","");
    var codigoOperador = document.getElementById('operador').value;	

    if( (codigoOperador == 400 && !multiploDeCincoMil(valRecargaTemp) && (valRecargaTemp < 15000 || valRecargaTemp> 150000 ) ) ||
        ((codigoOperador != 400) && (valRecargaTemp == 0 || valRecargaTemp == "" || multiploDeMil(valRecargaTemp))) ||
        ((codigoOperador == 400) && (valRecargaTemp == 0 || valRecargaTemp == "" || multiploDeCincoMil(valRecargaTemp))) ){
		
        //estilo si es recarga drectv
        if(codigoOperador == 400){            
            document.getElementById("enviar").disabled = false;
            valido = false;
            valorRecarga.blur();
            valorRecarga.classList.add("is-invalid-input");
            document.getElementById("icondollar").classList.add("is-invalid-label");
            document.getElementById("error-valor-directv").style.display = 'block';
            document.getElementById("error-valor").style.display = 'none';
            valorValido = false;
        }else{
            document.getElementById("enviar").disabled = false;
    		valido = false;
    		valorRecarga.blur();
    		valorRecarga.classList.add("is-invalid-input");
    		document.getElementById("icondollar").classList.add("is-invalid-label");
    		document.getElementById("error-valor").style.display = 'block';
            document.getElementById("error-valor-directv").style.display = 'none';
    		valorValido = false;
        }
       
	}else{
        
		if(valorValido == false){
			valorRecarga.classList.remove("is-invalid-input");
			document.getElementById("icondollar").classList.remove("is-invalid-label");
            document.getElementById("error-valor-directv").style.display = 'none';
            document.getElementById("error-valor").style.display = 'none';
			valorValido = true;	
		}
	}
	//valida numero de celular o de nro de directiv
	if( ( document.getElementById('operador').value != 400 && numeroCelular.value.length == 10) ||
			( document.getElementById('operador').value == 400 && numeroCelular.value.length == 12) ){
		if(numeroValido == false){
			numeroCelular.classList.remove("is-invalid-input");
			document.getElementById("iconmobile").classList.remove("is-invalid-label");
			document.getElementById("error-numero").style.display = 'none';
			document.getElementById("error-numero-directv").style.display = 'none';
			numeroValido = true;		
		}
	}else{
		if(document.getElementById('operador').value == 400){			
    		document.getElementById("enviar").disabled = false;
    		valido = false;
    		numeroCelular.blur();
    		numeroCelular.classList.add("is-invalid-input");
    		document.getElementById("iconmobile").classList.add("is-invalid-label");
    		document.getElementById("error-numero-directv").style.display = 'block';
    		document.getElementById("error-numero").style.display = 'none';
    		numeroValido = false;		
		}else{
    		document.getElementById("enviar").disabled = false;
    		valido = false;
    		numeroCelular.blur();
    		numeroCelular.classList.add("is-invalid-input");
    		document.getElementById("iconmobile").classList.add("is-invalid-label");
    		document.getElementById("error-numero").style.display = 'block';
    		document.getElementById("error-numero-directv").style.display = 'none';
    		numeroValido = false;		
		}
	}	


  var vendedor = vendedoresList.find(encontrarVendedor);
  //validar codigo y pin  de vendedor exista
  if (vendedor) {
  	vendedorValido = true;
  	normalizarEstilos();    
		//valida que no halla tenido error anterior
		if(vendedor.pinrecargas == null || vendedor.pinrecargas === "" ){
			document.getElementById("enviar").disabled = false;
			valido = false;
			pinRecarga.blur();
			pinRecarga.classList.add("is-invalid-input-warning");
			document.getElementById("icon-keyboard").classList.add("is-invalid-label-warning");
			document.getElementById("error-sinpin").style.display = 'block';
			pinValido = false;
		}else{
			//valida que el pin de recarga ingresado este correcto
			if(vendedor.pinrecargas.trim() === pinRecarga.value.trim()){
				pinRecarga.classList.remove("is-invalid-input");
				document.getElementById("icon-keyboard").classList.remove("is-invalid-label");
				document.getElementById("error-pin").style.display = 'none';
				pinValido = true;
			}else{
				document.getElementById("enviar").disabled = false;
				valido = false;
				pinRecarga.blur();
				pinRecarga.classList.add("is-invalid-input");
				document.getElementById("icon-keyboard").classList.add("is-invalid-label");
				document.getElementById("error-pin").style.display = 'block';
				pinValido = false;
			}
		}
  } else {
      //vendedor no Existe
      pinRecarga.classList.remove("is-invalid-input-warning");
  		document.getElementById("icon-keyboard").classList.remove("is-invalid-label-warning");
  		document.getElementById("error-sinpin").style.display = 'none';
  		document.getElementById("enviar").disabled = false;
      valido = false;
      codVendedor.blur();
      codVendedor.classList.add("is-invalid-input");
      document.getElementById("icon-user").classList.add("is-invalid-label");
      document.getElementById("error-vendedor").style.display = 'block';
      vendedorValido = false;
  }	
	return valido;
}

//usada por la funcion validarFormulario para 
//validar si el codigo del vendedor existe.
//https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/find
function encontrarVendedor(ven) { 
	return ven.codvende === codVendedor.value;
}

//oculta los alerts del formulario
function normalizarEstilos() {
  codVendedor.classList.remove("is-invalid-input");
  document.getElementById("icon-user").classList.remove("is-invalid-label");
  document.getElementById("error-vendedor").style.display = 'none';

  pinRecarga.classList.remove("is-invalid-input-warning");
  document.getElementById("icon-keyboard").classList.remove("is-invalid-label-warning");
  document.getElementById("error-sinpin").style.display = 'none';
  
  pinRecarga.classList.remove("is-invalid-input");
  document.getElementById("icon-keyboard").classList.remove("is-invalid-label");
  document.getElementById("error-pin").style.display = 'none';
}

//utilidad para mostrar un callout de error en los servicios
function mostrarFallaDelSistema(mensaje) {
	document.getElementById("form").classList.remove("nonBlur");
	document.getElementById("form").classList.add("blur");
    var divError = document.getElementById("error-sistema");
    divError.classList.add("active");
    document.getElementById("mesaje-falla").innerHTML = mensaje;
    document.getElementById("mesaje-falla-secundario").innerHTML =
        "Intente nuevamente, si persiste la falla contacte al administrador del Sistema.";
}

function limpiarCamposFormulario(){
		valorRecarga.value="";
    numeroCelular.value ="";    
    codVendedor.value =  "";
    pinRecarga.value = "";
    document.getElementById("operador").value = 266;

}

//metodo prdicado que valida si el numero es multiplo de Mil (1.000)
function multiploDeMil(vlRecarga){
	var residuo = (vlRecarga/1000) % 1;
	return !(residuo === 0); 
}
function multiploDeCincoMil(vlRecarga){
    var residuo = vlRecarga % 5000;
    return !(residuo === 0); 
}


//Valida si la recarga fue exitosa a pesar de ser abortada la peticion ajax
//
function validarRecarga(callback) {
    document.getElementById("form").classList.remove("nonBlur");
    document.getElementById("form").classList.add("blur");
    spinner.classList.add("active");
    var urlLocal = recarcaService;
    urlLocal += "opcion=validarrecarga&numcel=" + numeroCelular.value;
    $.ajax({
            url: urlLocal,
        })
        .done(function(res) {
            spinner.classList.remove("active");
            var respuesta = res.split(";");
            if (numeroCelular.value === respuesta[1] && valorRecarga.value.replace(",", "") === respuesta[0]) {
                callback(true);
            } else {
                callback(false);
            }
        })
        .fail(function(xhr, status, error) {
            mostrarFallaDelSistema(xhr.responseText);
        });
}

window.addEventListener('load',validacion,false);
