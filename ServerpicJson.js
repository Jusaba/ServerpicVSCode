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
* Funciones exportadas
* --------------------
* async CreaJson (cDispoitivo, cPlaca).- Crea el Json del proyecto
* async GetJson ().- Devuelve el json del fichero .vscod/serverpic.json
* async LeeParamJson (cParametro).- Lee el fichero .vscode/serverpic.json y devuelve el valor del indicador cParametro
* async GrabaParamJson (cParametro, cValor).- Lee .vscode/serverpic.json y grava en el identificador cParametro el valor cValor
*                                       Si no existe el identificador, lo añade como nuevo y vuelve a grabar el fichero .vscode/serverpic.json
*
* async DirWork().- Pruebas
* async CambioChip().- Funcion que permite cambiar la el modelo y la plataforma en un proyecto en trabajo
* async DatosPlataformaWork().- 
*
* Funciones internas 
* ------------------
* 
* async GenJson (cDispositivo, cPlaca).- Genera el Json del proyecto, solicita seleccion de plataforma y chip
* async CreaServerpicJson (oJson).- Crea el fichero INEXISTENTE .vscode/serverpic.json
* async GrabaServerpicJson (oJson).- Graba el Json oJson en el fichero Json del proyecto EXISTENTE
* async ChangeLibPlataforma (cPlataforma).- Cambia las librerias de Serverpic.h en funcion de la plataforma seleccionada
*******************************************************/
'use strict';
const { window } = require("vscode")
const vscode = require("vscode")
const fs = require('fs');
const BarraEstado = require ('./StatusBar.js');
const Ficheros = require ('./Ficheros.js');
const { Console } = require("console");
const cUsuario = require('os').homedir();
const Generico = require ('./Generico.js');

const we = new vscode.WorkspaceEdit();


const iPlataforma = 0;
const iVersion = 1;
const iModelo = 2;
const iPosicion = 3;
const iFqbn = 4;
const iConfiguracion = 5;
const iCompilador = 6;
const iDirCompilador = 7;


//Determinamos path del directorio de tarabjao

var DirectorioTrabajo;
const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`
const DirectorioPackages = `${cUsuario}\\AppData\\Local\\Arduino15\\packages`;
DirectorioTrabajo =  vscode.workspace.workspaceFolders[0].uri.toString();
var DirectorioVscode = `${DirectorioTrabajo}/.vscode`
DirectorioTrabajo = Generico.PathFileToDir(DirectorioTrabajo);
DirectorioVscode = Generico.PathFileToDir(DirectorioVscode);

var outChannel = vscode.window.createOutputChannel('Serverpic');





/**************************
* Funcion que genera el json de configuracion del proyecto
* 
* @param cDispositivo.- Nombre del dispositivo
* @param cPlaca.- Npombre de la placa
*
* Pide seleccionar una plataforma y el chip de la plataforma
*
* @return Devuelve el objeto Json de configuracion
*/
async function GenJson ( cDispositivo,  cPlaca )
{
		//Seleccionamos plataforma y determinamos la version del compilador instalado
		const cPlataforma = await Generico.GetPlataforma();
		const cVersionPlataforma = await Generico.GetVersionPlataforma(cPlataforma); 
		const cChip = await Generico.GetChip(cPlataforma);
		//Obtenemos los datos de la plataforma ( modelo chip, directorios, compilador, .... )
		const aDatosPlataforma = await Generico.GetDatosChip(cPlataforma, cChip);

		//Path con la carpeta del proyecto
			
		let oJson =																	//Elaboramos el json		
		{
			"dispositivo": cDispositivo,
			"folder": cDispositivo,
			"sketch": cDispositivo+'.ino',
			"plataforma": cPlataforma,
			"version": cVersionPlataforma,
			"modelo": aDatosPlataforma[iModelo],
			"placa": cPlaca,
			"fqbn": aDatosPlataforma[iFqbn],
			"configuration": aDatosPlataforma[iConfiguracion],
			"compilador": aDatosPlataforma[iCompilador],
			"com": 'COM',
			"baudios": 'Baudios', 
			"directorios":
			[	
				{
					"trabajo": 
					{
						"dirtrabajo" : DirectorioTrabajo,
						"dirvscode" : DirectorioVscode,		
						"diroutput" : DirectorioTrabajo + '/build'
					},
					"plataforma":
					{
						"dircompilador" : aDatosPlataforma[iDirCompilador]
					},
					"librerias":
					{
					
					},
					"forced":
					{

					}	
				}	
			]
		};
		//Añadimos los directorios especificos para las librerias de la plataforma seleccionada
		let JsonModelo = fs.readFileSync(`${cPathExtension}\\Placas\\${cPlataforma}.json`);
		let oModelo = JSON.parse(JsonModelo);
		let oLibrerias = oModelo.Boards[aDatosPlataforma[iPosicion]].librerias;				//Librerias particulares del modelo de chip
		oJson.directorios[0].librerias['variants'] = oLibrerias.variants;
		oLibrerias =  oModelo.librerias[0].plataforma;										//Librerias particulares de la plataforma
		oJson.directorios[0].librerias['include'] = oLibrerias.include;
		oJson.directorios[0].librerias['librerias'] = oLibrerias.librerias;
		oJson.directorios[0].librerias['cores'] = oLibrerias.cores;
		oJson.directorios[0].forced['forced'] = oLibrerias.forced;
		oLibrerias =  oModelo.librerias[0].genericas;										//Librerias genericas de Serverpic
		oJson.directorios[0].librerias['genericas'] = oLibrerias.genericas;															//Creamos el fichero		
		return(oJson);
}
/**************************
* Funcion que genera y graba el json de configuracion del proyecto
* 
* @param cDispositivo.- Nombre del dispositivo
* @param cPlaca.- Npombre de la placa
*
*/
exports.CreaJson = async function (cDispositivo,  cPlaca )
{
	const oJson = await GenJson(cDispositivo,  cPlaca );
	await CreaServerpicJson(oJson);	
	return (oJson);
}

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
* Funcion que graba un Json en el fichero .vscode/serverpic.json EXISTENTE
* 
* @param oJson.- Parametro que se quiere guardar
*
*/
async function GrabaServerpicJson (oJson)
{
	fs.writeFileSync(`${DirectorioTrabajo}/.vscode/serverpic.json`, JSON.stringify(oJson, null, 4));
}
/**************************
* Funcion que lee un parametro de la configuracion almacenada en Serverpic.json
* 
* @param cParametro.- Parametro que se quiere leer
* @return Devuelve el valor del parametro solicitado
*/
exports.LeeParamJson = async function (cParametro)
{
	var oJson = await this.GetJson ();
	return ((oJson[`${cParametro}`]));
}
/**************************
* Funcion que graba un nuevo valor para un parametro de la configuracion almacenada en Serverpic.json
* 
* @param cParametro.- Parametro que se quiere leer
*
*/
exports.GrabaParamJson = async function (cParametro, cValor)
{
	var oJson = await this.GetJson ();
	oJson[`${cParametro}`] = cValor;
	await GrabaServerpicJson (oJson);
}	
/**************************
* Funcion que crea el fichero .vscode/serverpic.json INEXISTENTE
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
*/
async function CreaServerpicJson (oJson)
{
	const cFile = Generico.PathDirToFile(oJson.directorios[0].trabajo.dirvscode);	
	let serverpicjson = vscode.Uri.parse(`${cFile}/serverpic.json`);
	we.createFile(serverpicjson, { ignoreIfExists: false, overwrite: true });
	let DataJson = JSON.stringify(oJson, null, 4);
	we.insert(serverpicjson, new vscode.Position(0, 0), DataJson);
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
	await vscode.workspace.applyEdit(we);   
	let document = await vscode.workspace.openTextDocument(serverpicjson); 
	await document.save();
}
/**************************
* Funcion llamada desde el ino que establece el directorio de trabajo y
* actualiza la barra de estado con los datos guardados en el Json
* 
*/

exports.Prueba = async function ()
{
/*
	var cPath = vscode.workspace.workspaceFolders[0].uri.toString();
	window.showInformationMessage(cPath);
	DirectorioTrabajo =  PathFileToDir(cPath);
	var oJson = await this.GetJson();
	BarraEstado.GrabaCom(oJson.com);
	BarraEstado.GrabaBaudios(oJson.baudios);
	BarraEstado.GrabaModelo(oJson.modelo);
*/
var oJson = await this.GetJson ();
const cParametro = 'plataforma';

console.log('---------------------------');
console.log(DirectorioTrabajo);
console.log (oJson[`${cParametro}`]);
console.log('---------------------------');
oJson[`${cParametro}`] ='llllll';
await GrabaServerpicJson (oJson);
}

/**************************
* Funcion que permite seleccionar una plataforma y/o modelo distintos
* actualiza la barra de estado, el json y genera un nuevo intellisense
*/
exports.CambioChip =   async function ()
{
	outChannel.clear();																		//Borramos la ventana de salida
	//Path extension vscode	
	var oJson = await this.GetJson();														//Cargamos el json
	const cPlataforma = await Generico.GetPlataforma();										//Seleccionamos plataforma
	const cChip = await Generico.GetChip(cPlataforma);											
	const aDatosPlataforma = await Generico.GetDatosChip(cPlataforma, cChip);						//Seleccionamos modelo y cargamos los datos de la plataforma y del modelo en aDatosPlataforma
	const cPlataformaOld = oJson.plataforma;												//Cargamos la plataforma actual
	const cModeloOld=oJson.modelo;															//Cargamos el modelo actual
console.log('--------------------------');
console.log(cPlataforma);
console.log(cPlataformaOld);
console.log(aDatosPlataforma[iModelo]);
console.log(cModeloOld);
console.log('--------------------------');




	if (cPlataformaOld != aDatosPlataforma[iPlataforma])									//Si Ha habido cambio de plataforma
	{

		outChannel.appendLine("Cambiando el modelo y la plataforma");

		outChannel.appendLine(`Nueva plataforma: ${aDatosPlataforma[iPlataforma]}`);				
		oJson.plataforma = aDatosPlataforma[iPlataforma];									//Actualizamos los datos de plataforma en el Json
		oJson.version = await Generico.GetVersionPlataforma(aDatosPlataforma[iPlataforma]);				//Actualizamos la version en el Json
		outChannel.appendLine(`Version: ${oJson.version}`);

		outChannel.appendLine(`Nuevo modelo: ${aDatosPlataforma[iModelo]}`);
		oJson.modelo = aDatosPlataforma[iModelo];
		oJson.fqbn = aDatosPlataforma[iFqbn];												//Acutalizamos Fqbn en el Json
		oJson.configuration = aDatosPlataforma[iConfiguracion];								//Actuallizamos la configuracion de compilacion en el Json

		outChannel.appendLine(`Cambiados compilador y directorio de compilador`);
		oJson.compilador = aDatosPlataforma[iCompilador];									//Actualizamos el compilador en el Json						
		oJson.directorios[0].plataforma.dircompilador = aDatosPlataforma[iDirCompilador];	//Actualizamos el directorio del compilador

		outChannel.appendLine(`Cambiadas las librerias del modelo`);
		let JsonModelo = fs.readFileSync(`${cPathExtension}\\Placas\\${cPlataforma}.json`);	//Leemos el json de la plataforma	
		let oModelo = JSON.parse(JsonModelo);			
		let oLibrerias = oModelo.Boards[aDatosPlataforma[iPosicion]].librerias;				//Leemos la libreria 'variants' del modelo	
		oJson.directorios[0].librerias['variants'] = oLibrerias.variants;					//Actualizamos el Json con la libreria variant del modelo seleccionado	
							
		outChannel.appendLine(`Cambiadas las librerias de la plataforma`);	
		oLibrerias =  oModelo.librerias[0].plataforma;										//Leemos las librerias pertenecientes a la plataforma	
		oJson.directorios[0].librerias['include'] = oLibrerias.include;						//Actualizamos el Json con las librerias de la plataforma
		oJson.directorios[0].librerias['librerias'] = oLibrerias.librerias;
		oJson.directorios[0].librerias['cores'] = oLibrerias.cores;
		oJson.directorios[0].forced['forced'] = oLibrerias.forced;

		outChannel.appendLine(`Generando Intellisense`);					
		Ficheros.CreateIntellisenseWork (oJson);											//Generamos c_cpp_properties.json
		outChannel.appendLine(`Generando el nuevo Json`);				
		await GrabaServerpicJson (oJson);															//Guardamos el nuevo Json
	}else{																					//Si solo ha habido cambio de modelo y no de plataforma
		if ( cModeloOld != aDatosPlataforma[iModelo])
		{
			outChannel.appendLine(`Nuevo modelo: ${aDatosPlataforma[iModelo]}`);
			oJson.fqbn = aDatosPlataforma[iFqbn];											//Grabamos el nuvo Fqbn en el Json
			oJson.configuration = aDatosPlataforma[iConfiguracion];							//Grabamos en el json la configuracion de compilacion
						
			outChannel.appendLine(`Cambiadas las librerias del modelo`);
			let JsonModelo = fs.readFileSync(`${cPathExtension}\\Placas\\${cPlataforma}.json`);		//Leemos el json de la plataforma
			let oModelo = JSON.parse(JsonModelo);			
			let oLibrerias = oModelo.Boards[aDatosPlataforma[iPosicion]].librerias;					//Leemos la libreria 'variants' del modelo	
			oJson.directorios[0].librerias['variants'] = oLibrerias.variants;	
		}	
	}
	ChangeLibPlataforma(aDatosPlataforma[iPlataforma]);
	outChannel.show();
}
/***********************************************
 *  Funcion exportable para Seleccionar modelo y plataforma en proyecto en trabajo
 */
exports.DatosPlataformaWork = async function ()
{

	const cDispositivo = await Generico.GetDispositivo();
	const cPlaca = await Generico.GetPlaca();
	const cPlataforma = await Generico.GetPlataforma();
	const cVersionPlataforma = await Generico.GetVersionPlataforma(cPlataforma);
	const cChip = await Generico.GetChip(cPlataforma);

	await Generico.GetDatosChip(cPlataforma, cChip);
console.log(cDispositivo+'  '+cPlaca+'  '+cPlataforma+'  '+cVersionPlataforma+'  '+cChip);
console.log(cPlataforma);
console.log(cVersionPlataforma);
const aDatosPlataforma = await Generico.GetDatosChip(cPlataforma, cChip);
console.log('Si');
//this.CreaJson(cDispositivo, cPlaca, 0);
	//return (DatosPlataforma(oJson.plataforma));
}
/***********************************************
 * Funcion que cambia las librerias de Serverpic.h en funcion de la plataforma seleccionada
 * @param cPlataforma.- Nueva plataforma de la que se quieren actualizar los datos
 */
async function ChangeLibPlataforma (cPlataforma)
{
	var lContenido = 0;
	var uriLibrerias;
	switch (cPlataforma) {																		//En funcion d ela plataforma, cargamos fichero con los includes
		case 'esp8266':
			uriLibrerias = vscode.Uri.file(`${cPathExtension}/Plantillas/includeesp8266.h`);
			break;
		case 'esp32':
			uriLibrerias = vscode.Uri.file(`${cPathExtension}/Plantillas/includeesp32.h`);
			break;
	}
	let oServerpicLib = await vscode.workspace.openTextDocument(uriLibrerias);					//Abrimos el fichero de includes
	let ServerpicLibTexto =  ((await oServerpicLib).getText()); 								//y cargamos el texto

	var uriServerpich = vscode.Uri.file(`${DirectorioTrabajo}/Serverpic.h`);					//Abrimos el fichero Serverpic.h de trabajo
	let oServerpich = await vscode.workspace.openTextDocument(uriServerpich);
	let ServerpichTexto =  ((await oServerpich).getText());										//y cargamos el texto

	var lineas = ServerpichTexto.split('\n');													//Hacemos un array con las lineas del fichero Serverpic.h 
	var nLinea = 0;
	for(var linea of lineas) {																	//Recorremos el arra
		if(linea.indexOf('//Librerias') > -1) {
		  lContenido = 1;
		  lineas[nLinea] = "#includes#"
		  var nLineaI = nLinea;
		}
		if ( lContenido )
		{
			//console.log(`${linea}`, linea)
		}
		if(linea.indexOf('//Fin librerias') > -1) {
			lContenido = 0;
			var nLineaF = nLinea;
		}	
		nLinea++;
	}
	lineas.splice(nLineaI + 1, nLineaF - nLineaI + 1 );
	ServerpichTexto = lineas.join('\n');
	//we.insert(uriServerpich, new vscode.Position(0, 0), ServerpichTexto)
	ServerpichTexto =    (ServerpichTexto.toString()).replace('#includes', ServerpicLibTexto );
	console.log(ServerpichTexto);
	//console.log(document);
	fs.writeFileSync(`${DirectorioTrabajo}/Serverpic.h`, ServerpichTexto );
	//	var cPath = vscode.workspace.workspaceFolders[0].uri.toString();
//	window.showInformationMessage(cPath);
//	DirectorioTrabajo =  PathFileToDir(cPath);

}