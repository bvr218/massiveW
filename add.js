let conectado = false

let socket = io()
socket.emit("paises", "");
/*
socket.on('connect', function() {
    console.log(socket.id);
})
*/
$(function () {

    
    $('#pais').select2();

});
socket.on("porcentaje",data =>{
    $("#login-alert").css("display", "block");
    $("#login-alert").empty();
    $("#login-alert").append("Generando "+ Math.trunc(data)+"%");
    $("#login-alert").removeClass("alert-danger");
    $("#login-alert").addClass("alert-success");
    $("#btn-login").attr("disabled","enabled");
})
socket.on("download", function (data) {
    window.open('/wallapos/contactos.vcf', '_blank');
    $("#login-alert").css("display", "none");
    //socket.emit("unlink","");
    $("#btn-login").removeAttr("disabled");
});
socket.on("fileReady", function () {
    let name = $("#linkImagen").val();
    $("#nombreImagen").empty();
    name = name.split('\\');
    $("#nombreImagen").append("*"+name[name.length - 1] +"<span id='alertas' class=' alert-success'>Archivo listo</span>");
    //socket.emit("unlink","");
    $("#btn-login").removeAttr("disabled");
});
socket.on("fileCReady", function () {
    let name = $("#linkFile").val();
    $("#nombreFile").empty();
    name = name.split('\\');
    $("#nombreFile").append("*"+name[name.length - 1] +"<span id='alertas' class=' alert-success'>Archivo listo</span>");
    //socket.emit("unlink","");
    $("#btn-login").removeAttr("disabled");
});
socket.on("paises", function (data) {
    let paises = data["countries"];
    paises = paises.sort(function (a, b) {
        //console.log(a.dial_code+" "+b);
        return a.dial_code - b.dial_code;
    });
    $("#pais").append("<option value=''>Seleccione Pais</option>");
    paises.forEach(element => {
        //console.log(element);
        $("#pais").append(`<option value="${element.dial_code}">${element.name_es} (${element.dial_code})</option>`);
    });
})

function validacion() {
    if ($("#validar").is(':checked')) {
        $("#login-alert").css("display", "block");
        $("#login-alert").empty();
        $("#login-alert").append("Espere");
        $("#login-alert").removeClass("alert-danger");
        $("#login-alert").addClass("alert-success");
        socket.emit("estado", "");
    } else {
        $("#mensajebox").css("display", "none");
        $("#login-alert").css("display", "none");
    }
}
function verArchivo(){
    let name = $("#linkImagen").val();
    name = name.split('\\');
    $("#nombreImagen").append("*"+name[name.length - 1] +"<span id='alertas' class='alert-warning'>Subiendo archivo...</span>");
    $("#btn-login").attr("disabled","disabled");
    var file = document.getElementById('linkImagen').files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e){
        socket.emit("fileImg",e.target.result);
    };
}
function verFile(){
    let name = $("#linkFile").val();
    name = name.split('\\');
    $("#nombreFile").append("*"+name[name.length - 1] +"<span id='alertas' class='alert-warning'>Subiendo archivo...</span>");
    $("#btn-login").attr("disabled","disabled");
    var file = document.getElementById('linkFile').files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e){
        socket.emit("fileFile",e.target.result);
    };
}
function reiniciar() {
    $("#login-alert").css("display", "block");
    $("#login-alert").empty();
    $("#login-alert").append("Reiniciando Conexion Espere..");
    $("#login-alert").addClass("alert-danger");
    $("#login-alert").removeClass("alert-success");
    $.get("/wallapos/delete.php")
        .done(function (salida) {
            console.log(salida);
        })

}
socket.on("ready", function () {
    $("#login-alert").css("display", "block");
    conectado = true;
    $("#login-alert").empty();
    $("#login-alert").append("Su conexion con Whatsapp esta lista");
    $("#login-alert").removeClass("alert-danger");
    $("#login-alert").addClass("alert-success");
    $("#login-alert").append("<a class='btn btn-warning' onclick='reiniciar()'>Reiniciar conexion</a>");
})
socket.on("disconected", function () {
    $("#login-alert").css("display", "block");
    conectado = true;
    $("#login-alert").empty();
    $("#login-alert").append("Se desconecto de whatsapp, reinicie la conexion");
    $("#login-alert").removeClass("alert-danger");
    $("#login-alert").addClass("alert-success");
    $("#login-alert").append("<a class='btn btn-warning' onclick='reiniciar()'>Reiniciar conexion</a>");
})
socket.on("estado", function (dato) {
    switch (dato) {
        case "disconected":
            conectado = false;
            $("#mensajebox").css("display", "none");
            $("#login-alert").empty();
            $("#login-alert").append("Espere...<br>"); 
            $("#login-alert").removeClass("alert-danger");
            $("#login-alert").addClass("alert-success");
            $("#login-alert").append("<a class='btn btn-warning' onclick='reiniciar()'>Reiniciar conexion</a>");
            break;
        case "conected":
            conectado = true;
            $("#mensajebox").css("display", "inline-block");
            $("#login-alert").empty();
            $("#login-alert").append("Su conexion con Whatsapp esta lista");
            $("#login-alert").removeClass("alert-danger");
            $("#login-alert").addClass("alert-success");
            $("#login-alert").append("<a class='btn btn-warning' onclick='reiniciar()'>Reiniciar conexion</a>");
            break;
    }
})
socket.on("autenticated", function () {
    $("#login-alert").css("display", "block");
    $("#login-alert").empty();
    $("#login-alert").append("Su conexion con Whatsapp ya se autenticó");
    $("#login-alert").removeClass("alert-danger");
    $("#login-alert").addClass("alert-success");
    $("#login-alert").append("<a class='btn btn-warning' onclick='reiniciar()'>Reiniciar conexion</a>");
})
socket.on("qr", function (data) {
    $("#login-alert").css("display", "block");
    $("#mensajebox").css("display", "none");
    $("#login-alert").empty();
    $("#login-alert").append(`<img src='${data}'>`);
    $("#login-alert").addClass("alert-success");
    $("#login-alert").append("<a class='btn btn-warning' onclick='reiniciar()'>Reiniciar conexion</a>");
})
socket.on("auth_failure", function () {
    $("#login-alert").css("display", "block");
    $("#login-alert").empty();
    $("#login-alert").append("Ocurrio un error con la autenticacion, reinicie la conexion y vuelva a intentar");
    $("#login-alert").append("<a class='btn btn-warning' onclick='reiniciar()'>Reiniciar conexion</a>");
    $("#login-alert").removeClass("alert-danger");
    $("#login-alert").addClass("alert-success");
})

function generar() {
    let desde = $("#desde").val();
    let hasta = $("#hasta").val();
    let pais = $("#pais").val();
    let wsp = $("#validar").is(':checked');
    let msg = $("#sendM").is(':checked');
    let img = $("#sendI").is(':checked');
    let btn = $("#sendB").is(':checked');
    let fileC = $("#sendC").is(':checked');
    let linkBoton = $("#linkBoton").val();
    let msgT = $("#mensaje").val();
    if(msg){
        if(btn){
            if(! /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(linkBoton)){
                $("#linkBoton").css("border-color","red");
                return null;
            }
        }
        if(img){
            var file = document.getElementById('linkImagen').files[0];
            if(file){
    
            }else{
                $("#linkImagen").css("border-color","red");
                return null;
            }
        }
    }
    if(fileC){
        desde = 1000000;
        hasta = 2000000;
    }
    if (pais == null || pais == "") {
        $("#login-alert").css("display", "block");
        $("#desde").css("border-color", "red");
        $("#login-alert").empty();
        $("#login-alert").append("Por favor, rellene todos los campos");
        $("#login-alert").removeClass("alert-success");
        $("#login-alert").addClass("alert-danger");
    } else if (desde == null || desde == "") {
        $("#login-alert").css("display", "block");
        $("#hasta").css("border-color", "red");
        $("#login-alert").empty();
        $("#login-alert").append("Por favor, rellene todos los campos");
        $("#login-alert").removeClass("alert-success");
        $("#login-alert").addClass("alert-danger");
    } else if (hasta == null || desde == "") {
        $("#login-alert").css("display", "block");
        $("#login-alert").empty();
        $("#login-alert").append("Por favor, rellene todos los campos");
        $("#login-alert").removeClass("alert-success");
        $("#login-alert").addClass("alert-danger");
    } else {
        if (desde > hasta) {
            $("#login-alert").css("display", "block");
            $("#login-alert").removeClass("alert-success");
            $("#login-alert").addClass("alert-danger");
            $("#login-alert").empty();
            $("#login-alert").append("El valor final debe ser mayor que el inicial");
        } else {
            if ($("#validar").is(':checked')) {
                if (conectado == false) {
                    $("#login-alert").css("display", "block");
                    $("#login-alert").addClass("alert-success");
                    $("#login-alert").removeClass("alert-danger");
                    $("#login-alert").empty();
                    $("#login-alert").append("Conecte primero su telefono a whatsapp");
                } else {
                    if (desde < 1000000 || hasta > 99999999999) {
                        $("#login-alert").css("display", "block");
                        $("#login-alert").removeClass("alert-success");
                        $("#login-alert").addClass("alert-danger");
                        $("#login-alert").empty();
                        $("#login-alert").append("El numero es invalido");
                    } else {
                        $("#login-alert").css("display", "block");
                        $("#login-alert").removeClass("alert-danger");
                        $("#login-alert").addClass("alert-success");
                        $("#login-alert").empty();
                        $("#login-alert").append("Generando contactos...");
                        let data = { desde, hasta, pais, wsp , msg , btn , img , linkBoton, msgT, fileC};
                        socket.emit("generar", data);
                    }
                }
            } else {
                if (desde < 100000000 || hasta > 9999999999) {
                    $("#login-alert").css("display", "block");
                    $("#login-alert").removeClass("alert-success");
                    $("#login-alert").addClass("alert-danger");
                    $("#login-alert").empty();
                    $("#login-alert").append("El numero es invalido");
                } else {
                    $("#login-alert").css("display", "block");
                    $("#login-alert").removeClass("alert-danger");
                    $("#login-alert").addClass("alert-success");
                    $("#login-alert").empty();
                    $("#login-alert").append("Generando contactos...");
                    let data = { desde, hasta, pais, wsp , msg , btn , img , linkBoton, msgT, fileC };
                    socket.emit("generar", data);
                }
            }


        }

    }
}
function addButton(){
    if ($("#sendB").is(':checked')){
        $("#labelSendB").empty();
        $("#labelSendB").append('<i class="	fa fa-thumbs-down fa-2x"></i>');
        $(".Boton").css("display","block");

    }else{
        $("#labelSendB").empty();
        $("#labelSendB").append('<i class="	fa fa-thumbs-up fa-2x"></i>');
        $(".Boton").css("display","none");
    }
}
function addImage(){
    if ($("#sendI").is(':checked')){
        $("#labelSendI").css("color","red");
        $(".Imagen").css("display","block");
    }else{
        $("#labelSendI").css("color","black");
        $(".Imagen").css("display","none");
    }
}
function addFile(){
    if ($("#sendC").is(':checked')){
        $("#desde").attr("disabled","disabled");
        $("#hasta").attr("disabled","disabled");
        $("#labelSendC").css("color","red");
        $(".File").css("display","block");
    }else{
        $("#desde").removeAttr("disabled");
        $("#hasta").removeAttr("disabled");
        $("#labelSendC").css("color","black");
        $(".File").css("display","none");
    }
}

function addMensaje(){
    if ($("#sendM").is(':checked')){
        $("#labelSendM").empty();
        $("#labelSendM").append('<i class="fa fa-paper-plane-o fa-2x"></i>');
        $("#textoMensaje").empty();
        $("#textoMensaje").css("color","green");
        $("#textoMensaje").append('Enviar mensaje');

    }else{
        $("#labelSendM").empty();
        $("#labelSendM").append('<i class="fa fa-paper-plane fa-2x"></i>');
        $("#textoMensaje").empty();
        $("#textoMensaje").css("color","red");
        $("#textoMensaje").append('No enviar mensaje');
    }
}
