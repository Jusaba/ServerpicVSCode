/**
******************************************************
* @file ServerpicJson.js
* @brief Gestion del fichero.vscode/serverpic.json para la extesionon de vscode Serverpic
* @author Julian Salas Bartolome
* @version 1.0
* @date Noviembre 2022
*
* Se exportan las funciones para leer un parametro del json del fichero y para guardar un valor en cualquier parametro del json del fichero
* 
*******************************************************/
'use strict';
const vscode = require("vscode")

const fs = require('fs');

//Determinamos path del directorio de tarabjao
const thisWorkspace = vscode.workspace.workspaceFolders[0].uri.toString();
var DirectorioTrabajo = `${thisWorkspace}`;
DirectorioTrabajo = (DirectorioTrabajo.toString()).replace('%20', ` `);			//Cambiamos el %20 por espacio
DirectorioTrabajo = (DirectorioTrabajo.toString()).replace('file:///', ``);		//Quitamos el texto 'file///'
DirectorioTrabajo = (DirectorioTrabajo.toString()).replace('%3A', ':');			//Quitamos el '%3A' por ':'

/**************************
* Funcion que lee un el json del fichero .vscode/serverpic.json de la carpeta de trabajo
* 
* @return Devuelve el objeto Json contenido en el fichero
*/
exports.GetJson = async function ()
{
    var fServerpicJson = fs.readFileSync (`${DirectorioTrabajo}/.vscode/serverpic.json`);	//Leemos serverpic.json del dispositivo
    var oServerpicJson = JSON.parse(fServerpicJson);
	return (oServerpicJson);
}    
/**************************
* Funcion que lee un el json del fichero .vscode/serverpic.json de la carpeta de trabajo
* 
* @return Devuelve el objeto Json contenido en el fichero
*/
async function LeeServerpicJson ()
{
    var fServerpicJson = fs.readFileSync (`${DirectorioTrabajo}/.vscode/serverpic.json`);	//Leemos serverpic.json del dispositivo
    var oServerpicJson = JSON.parse(fServerpicJson);
	return (oServerpicJson);
}    
/**************************
* Funcion que graba un Json en el fichero .vscode/serverpic.json
* 
* @param oJson.- Parametro que se quiere guardar
*
*/
async function GrabaServerpicJson (oJson)
{
	console.log(oJson);
	fs.writeFileSync(`${DirectorioTrabajo}/.vscode/serverpic.json`, JSON.stringify(oJson));
	console.log(`${DirectorioTrabajo}/.vscode/serverpic.json`);
}
/**************************
* Funcion que lee un parametro de la configuracion almacenada en Serverpic.json
* 
* @param cParametro.- Parametro que se quiere leer
* @return Devuelve el valor del parametro solicitado
*/
exports.LeeParamJson = async function (cParametro)
{
	var cDato;
	var oJson = await LeeServerpicJson ();
	switch (cParametro) {
		case 'sketch':
			cDato = oJson.sketch;
			break;
		case 'plataforma':
			cDato = oJson.plataforma;
			break;
		case 'version':
			cDato = oJson.version;
			break;
		case 'board':
			cDato = oJson.board;
			break;
		case 'fqbn':
			cDato = oJson.fqbn;
			break;
		case 'configuracion':
			cDato = oJson.configuracion;
			break;
		case 'compilador':
			cDato = oJson.compilador;
			break;
		case 'dircompilador':
			cDato = oJson.dircompilador;
			break;
		case 'output':
			cDato = oJson.output;
			break;
		case 'com':
			cDato = oJson.com;
			break;
		case 'baudios':
			cDato = oJson.baudios;
			break;
										
	}
	return (cDato);
}
/**************************
* Funcion que graba un nuevo valor para un parametro de la configuracion almacenada en Serverpic.json
* 
* @param cParametro.- Parametro que se quiere leer
*
*/
exports.GrabaParamJson = async function (cParametro, cValor)
{
	var oJson = await LeeServerpicJson ();
	switch (cParametro) {
		case 'sketch':
			oJson.sketch = cValor;
			break;
		case 'plataforma':
			oJson.plataforma = cValor;
			break;
		case 'version':
			oJson.version = cValor;
			break;
		case 'board':
			oJson.board = cValor;
			break;
		case 'fqbn':
			oJson.fqbn = cValor;
			break;
		case 'configuracion':
			oJson.configuracion = cValor;
			break;
		case 'compilador':
			oJson.compilador = cValor;
			break;
		case 'dircompilador':
			oJson.dircompilador = cValor;
			break;
		case 'output':
			oJson.output = cValor;
			break;
		case 'com':
			oJson.com = cValor;
			break;
		case 'baudios':
			oJson.baudios = cValor;
			break;						
	}
	await GrabaServerpicJson (oJson);

}	