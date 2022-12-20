/**
******************************************************
* @file CreaSnippet.js
* @brief Crea los Snippets de trabajo
* @author Julian Salas Bartolome
* @version 1.0
* @date Diciembre 2022
*
*/
/**************************
* Funcion que crea el snipet ESP32Lib
* Crea ESP32Lib para introcudir las librerias de ESP32 en Serverpic.h
* Includeesp32.h debe acabar en una linea en blanco por que la funcion en cada linea elimina el 
* ultimo caracter que es \n, si no introducimos esa linea en blnco nos corta el ultimo caracter de la ultima linea
*
* @return Retorna elcodigo del snippet
*/
'use strict';
const { window } = require("vscode")
const vscode = require("vscode")
const cUsuario = require('os').homedir();
const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`
//const JsonServerpic = require('./ServerpicJson.js');
//const oJson = JsonServerpic.GetJson();
//const cPathVSCode = oJson.directorios[0].trabajo.dirtrabajo;
/**************************
* Funcion que crea el snipet ESP32Lib
* Crea ESP32Lib para introcudir las librerias de ES32 en Serverpic.h
* Includeesp32.h debe acabar en una linea en blanco por que la funcion en cada linea elimina el 
* ultimo caracter que es \n, si no introducimos esa linea en blnco nos corta el ultimo caracter de la ultima linea
*
* @return Retorna elcodigo del snippet
*/
 async function Crea_ESP32Lib()
{
    const uriFileIncludeESP32 = vscode.Uri.file(`${cPathExtension}/Plantillas/includeesp32.h`);
	let oIncludeESP32 = await vscode.workspace.openTextDocument(uriFileIncludeESP32);			//Abrimos el fichero de includes
	let IncludeESP32LibTexto =  ((await oIncludeESP32).getText()); 								//y cargamos el texto
    IncludeESP32LibTexto = IncludeESP32LibTexto.split('"').join('\\\"');	                    //Sustituimos " por \"
    var aLineas = IncludeESP32LibTexto.split('\n');												//Hacemos un array con las lineas del texto con los includes
    var nlinea = 0;
    for(var linea of aLineas) {	
        aLineas[nlinea] = '"'+aLineas[nlinea].substring(0, aLineas[nlinea].length -1)+'",';	
        nlinea++;
    }
    IncludeESP32LibTexto =  aLineas.join('\n');  
    var cSnippet = "\"ESP32Lib\": {"+'\n';
    cSnippet = cSnippet +"  \"prefix\": \"ESP32Lib\","+'\n';
    cSnippet = cSnippet +"  \"body\":["+'\n';
    cSnippet = cSnippet + IncludeESP32LibTexto+'\n';
    cSnippet = cSnippet + " ],"+'\n';
    cSnippet = cSnippet + "\"description\": \"Librerias ESP32 para Serverpic.h\""+'\n';
    cSnippet = cSnippet +"}";

    return (cSnippet);

}
/**************************
* Funcion que crea el snipet ESP8266Lib
* Crea ESP8266Lib para introcudir las librerias de ESP8266 en Serverpic.h
* Includeesp8266.h debe acabar en una linea en blanco por que la funcion en cada linea elimina el 
* ultimo caracter que es \n, si no introducimos esa linea en blnco nos corta el ultimo caracter de la ultima linea
*
* @return Retorna elcodigo del snippet
*/
async function Crea_ESP8266Lib()
{
    const uriFileIncludeESP8266 = vscode.Uri.file(`${cPathExtension}/Plantillas/includeesp8266.h`);
	let oIncludeESP8266 = await vscode.workspace.openTextDocument(uriFileIncludeESP8266);			//Abrimos el fichero de includes
	let IncludeESP8266LibTexto =  ((await oIncludeESP8266).getText()); 								//y cargamos el texto
    IncludeESP8266LibTexto = IncludeESP8266LibTexto.split('"').join('\\\"');	                    //Sustituimos " por \"
    var aLineas = IncludeESP8266LibTexto.split('\n');												//Hacemos un array con las lineas del texto con los includes
    var nlinea = 0;
    for(var linea of aLineas) {	
        aLineas[nlinea] = '"'+aLineas[nlinea].substring(0, aLineas[nlinea].length -1)+'",';	
        nlinea++;
    }
    IncludeESP8266LibTexto =  aLineas.join('\n');  
    var cSnippet = "\"ESP8266Lib\": {"+'\n';
    cSnippet = cSnippet +"  \"prefix\": \"ESP8266Lib\","+'\n';
    cSnippet = cSnippet +"  \"body\":["+'\n';
    cSnippet = cSnippet + IncludeESP8266LibTexto+'\n';
    cSnippet = cSnippet + " ],"+'\n';
    cSnippet = cSnippet + "\"description\": \"Librerias ESP8266 para Serverpic.h\""+'\n';
    cSnippet = cSnippet +"}";

    return (cSnippet);   

}
/**************************
* Funcion que crea el snipet LORA32Lib
* Crea LORA32Lib para introcudir las librerias de LORA32Lib en Serverpic.h
* includeHeltec-esp32.h debe acabar en una linea en blanco por que la funcion en cada linea elimina el 
* ultimo caracter que es \n, si no introducimos esa linea en blnco nos corta el ultimo caracter de la ultima linea
*
* @return Retorna elcodigo del snippet
*/
async function Crea_LORA32Lib()
{
    const uriFileIncludeHeltecesp32 = vscode.Uri.file(`${cPathExtension}/Plantillas/includeHeltec-esp32.h`);
	let oIncludeHeltecesp32 = await vscode.workspace.openTextDocument(uriFileIncludeHeltecesp32);	//Abrimos el fichero de includes
	let IncludeHeltecesp32LibTexto =  ((await oIncludeHeltecesp32).getText()); 								//y cargamos el texto
    IncludeHeltecesp32LibTexto = IncludeHeltecesp32LibTexto.split('"').join('\\\"');	                    //Sustituimos " por \"
    var aLineas = IncludeHeltecesp32LibTexto.split('\n');												//Hacemos un array con las lineas del texto con los includes
    var nlinea = 0;
    for(var linea of aLineas) {	
        aLineas[nlinea] = '"'+aLineas[nlinea].substring(0, aLineas[nlinea].length -1)+'",';	
        nlinea++;
    }
    IncludeHeltecesp32LibTexto =  aLineas.join('\n');  
    var cSnippet = "\"LORA32Lib\": {"+'\n';
    cSnippet = cSnippet +"  \"prefix\": \"LORA32Lib\","+'\n';
    cSnippet = cSnippet +"  \"body\":["+'\n';
    cSnippet = cSnippet + IncludeHeltecesp32LibTexto+'\n';
    cSnippet = cSnippet + " ],"+'\n';
    cSnippet = cSnippet + "\"description\": \"Librerias LoRa 32 para Serverpic.h\""+'\n';
    cSnippet = cSnippet +"}";

    return (cSnippet);   

}
exports.CreaSnippets= async function()
{
    var cSnippet = "{"+'\n';
    cSnippet = cSnippet + await Crea_ESP32Lib();
    cSnippet = cSnippet + ","+'\n';
    cSnippet = cSnippet + await Crea_ESP8266Lib();
    cSnippet = cSnippet + ","+'\n';
    cSnippet = cSnippet + await Crea_LORA32Lib();
    cSnippet = '\n'+cSnippet + "}"+'\n';
    console.log(cSnippet);
}