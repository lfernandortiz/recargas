
//Formato para el valor de la recarga
(function($, undefined) {

	"use strict";

	// When ready.
	$(function() {
		
		var $form = $( "#form" );
		var $input = $form.find( "#valor-recarga" );
		
		$input.on( "keyup", function( event ) {
			
			
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
			
			console.log( arr );
			
			event.preventDefault();
		});
		
	});
})(jQuery);

var valorRecarga; 	//almacena el valor a recargas
var numeroCelular;	//almacena el nro a recargas
var operador;		//codigo del operador
var codVendedor;	//codigo del vendedor
var pinRecarga;		//codigo personal del vendedor para recargas

function iniciar(){
	
	var btnOkAlerta = document.getElementById("okalerta");
	var btnWarning = document.getElementById("okwarning");
	var btnSucess = document.getElementById("oksucess");

	btnOkAlerta.addEventListener("click", function(e){
		e.target.parentNode.parentNode.classList.remove("active");
	}, false);
	btnWarning.addEventListener("click", function(e){
		e.target.parentNode.parentNode.classList.remove("active");
	}, false);
	btnSucess.addEventListener("click", function(e){
			e.target.parentNode.parentNode.classList.remove("active");
	}, false);

	var btnEnviar = document.getElementById("enviar");
	btnEnviar.addEventListener("click", procesarRecarga, false);
}


function procesarRecarga(){
	console.log("procesando recarga..");
	
	// obtiene los datos del formulario 
	valorRecarga = document.getElementById("valor-recarga");  	
	numeroCelular = document.getElementById("numero-celular");	
	var comboOperador = document.getElementById("operador");
	voperador = comboOperador.options[comboOperador.selectedIndex].value;		
	codVendedor = document.getElementById("codigo-vendedor");	
	pinRecarga = document.getElementById("pin-vendedor");

	// en caso de inconsistencias se informara el valor errado

	// se envian los datos al servidor y se muestra el spinner
	if(validarFormulario()){
		var url = "ventas.php?";
		var nombre = document.getElementById("nombreCliente").value;
		var email = document.getElementById("emailCliente").value;
		var telefono = document.getElementById("telefonoCliente").value;
		var comentario = document.getElementById("comentarioCliente").value;
		url += "nombrecliente=" + nombre + "&email=" + email + "&telefono=" + telefono + "&comentario=" + comentario;
		try {
			asyncRequest = new XMLHttpRequest();
			asyncRequest.addEventListener("readystatechange", stateChange, false);
			asyncRequest.open("GET", url, true);
			asyncRequest.send(null);
		} catch (excepcion) {}
	}else{
		// document.getElementById("calloutFormAlert").style.display = 'block';
	}
}


function validarFormulario(){	
	var  valido = true ;
	var valRecargaTemp = valorRecarga.value.replace(",","");	
	if( valRecargaTemp == 0 || valRecargaTemp == "" || multiploDeMil(valRecargaTemp)){
		valido = false;
		valorRecarga.blur();
		valorRecarga.classList.add("is-invalid-input");
		document.getElementById("icondollar").classList.add("is-invalid-label");
		document.getElementById("error-valor").style.display = 'block';
		
	}

	console.log(numeroCelular.value < 10);
	if(numeroCelular.value.length < 10){
		valido = false;
		numeroCelular.blur();
		numeroCelular.classList.add("is-invalid-input");
		document.getElementById("iconmobile").classList.add("is-invalid-label");
		document.getElementById("error-numero").style.display = 'block';


	}
	
	return valido;
}

function multiploDeMil(vlRecarga){
	var residuo = (vlRecarga/1000) % 1;
	return !(residuo === 0); 
}

window.addEventListener('load',iniciar,false);



