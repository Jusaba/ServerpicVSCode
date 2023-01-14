/**
******************************************************
* @file Ficheros.js
* @brief Creacion de los ficheros basicos del proyecto
* @author Julian Salas Bartolome
* @version 1.0
* @date Noviembre 2022
*
* Se crean lso distintos ficheros que componen el proyecto
*
* Funciones exportadas
* --------------------
* async CreaArchivos(oJson) .- Función que crea los distintos archivos del proyecto
* async GeneraPorperties().- Funcion que genera el fichero .vscode/c_cpp_properties en un proyecto existente con .vscode/serverpic.json existente
*
* Funciones internas 
* ------------------
* async CreaIO.- Crea el fichero IO.h
* async CreaTeamCity().- Crea el fichero TeamCity.sh
* async CreaServerpic().- Crea el fichero Serverpic.h
* async CreaIno().- Crea el fichero Ino  
* async CreaBoardList().- Crea el fichero BoardList.sh
* async CreaHardware().- Crea el fichero Hardware	
* async CreaCompila().- Crea el fichero Compila.bat
* async CreaUpload().- Crea el fichero Upload.bat
* async CreaProperties(lWork).- Crea el fichero c_cpp_properties.json
* 
* async ReplaceParamsInPath (cDirectorio). Sustituye en una cadena de direcotio los parametros #..# por sus valores reales
* async ListDirInPath (cDirectorio). Devuelve una cadena con todos los directorios contenidos en cDirectorio
* async Create_Intellisense (). Obtenemos un listado de todos los directorios con librerias para intellisense
*
* 
*******************************************************/
const vscode = require("vscode");
const we = new vscode.WorkspaceEdit();
const Generico = require ('./Generico.js');

let Fecha = new Date();													//Fecha para las cabeceras de los ficheros
Fecha = Fecha.toLocaleDateString();	
const cUsuario = require('os').homedir();								//Directorio usuario
const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`;	//Deirectorio de la extension
const fs = require('fs');
var oJson;																//Json con la información del proyecto

const JsonServerpic = require('./ServerpicJson.js');
const { Console } = require("console");

var cPathProyecto  = vscode.workspace.workspaceFolders[0].uri.toString();;														//Directorio del proyecto


/**************************
* Funcion que crea los distintos ficheros del proyecto
* 
* utiliza .vscode/serverpic.json
* Esa configuracion se almacena en .vscode/serverpic.json
*/
exports.CreaArchivos = async function (oServerpicJson)
{
    oJson = oServerpicJson;											//Asignamos el Json a la variable global
    //cPathProyecto = oJson.directorios[0].trabajo.dirtrabajo;		//Obtenemos el directorio del proyecto 
    //cPathProyecto = Generico.PathDirToFile(cPathProyecto);

     var aFicheros = [];											//Array donde se almacenaran los punteros de los ficheros

    aFicheros.push(await CreaIO());									//Crea los distintos ficheros
    aFicheros.push(await CreaTeamCity());
    aFicheros.push(await CreaServerpic());
    aFicheros.push(await CreaIno());  
    aFicheros.push(await CreaBoardList());
    aFicheros.push(await CreaHardware());
    aFicheros.push(await CreaCompila());
    aFicheros.push(await CreaUpload());
    aFicheros.push(await CreaProperties(0));

	await vscode.workspace.applyEdit(we);							//Cerramos los distintos ficheros	
	for (const Fichero of aFicheros) { let document = await vscode.workspace.openTextDocument(Fichero); await document.save(); };
}
/**************************
* Funcion que crea el fichero IO.h
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
* @param Retorna el puntero al fichero
*/
async function CreaIO()
{
    let IO = vscode.Uri.parse(`${cPathProyecto}/IO.h`);
    we.createFile(IO, { ignoreIfExists: false, overwrite: true });
    let uriIO = vscode.Uri.file(`${cPathExtension}/Plantillas/IO.h_`);                                                       //Establecemos el path de la plantilla IO
    let oIOTexto = await vscode.workspace.openTextDocument(uriIO);                                                                  //Cargamos la plantilla IO
    let IOTexto =  await oIOTexto.getText();                                                                               //Extraemos el texto de la plantilla 
    IOTexto = IOTexto.split('#Placa#').join(oJson.placa);   																		  //Hacemos los remplazos pertinentes	
    IOTexto = IOTexto.split('#Dispositivo#').join(oJson.folder); 
    IOTexto = IOTexto.split('#Fecha#').join(Fecha); 
    we.insert(IO, new vscode.Position(0, 0), IOTexto);     
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor'); 
    return (IO);
} 
/**************************
* Funcion que crea el fichero TeamCity.sh
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
* @param Retorna el puntero al fichero
*/
async function CreaTeamCity ()
{
    let TeamCity = vscode.Uri.parse(`${cPathProyecto}/TeamCity.sh`);
    we.createFile(TeamCity, { ignoreIfExists: false, overwrite: true });
	let uriTeamCity = vscode.Uri.file(`${cPathExtension}/Plantillas/TeamCity.s_`);                                           //Establecemos el path de la plantilla TeamCity
	let oTeamCityTexto = await vscode.workspace.openTextDocument(uriTeamCity);                                                      //Cargamos la plantilla TeamCity
	let TeamCityTexto = ((await oTeamCityTexto).getText());                                                                   //Extraemos el texto de la plantilla    
	//TeamCityTexto = (TeamCityTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                  //Hacemos los remplazos pertinentes
	TeamCityTexto = TeamCityTexto.split('#Dispositivo#').join(oJson.folder);;												   //Hacemos los remplazos pertinentes
	we.insert(TeamCity, new vscode.Position(0, 0), TeamCityTexto);                                                             //Grabamos la informacion en TeamCity.sh
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
    return(TeamCity);
}

/**************************
* Funcion que crea el fichero Serverpic.h
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
* @param Retorna el puntero al fichero
*/
//-------------------
async function CreaServerpic ()
{
    let Serverpic = vscode.Uri.parse(`${cPathProyecto}/Serverpic.h`);
    we.createFile(Serverpic, { ignoreIfExists: false, overwrite: true });
    let uriServerpic = vscode.Uri.file(`${cPathExtension}/Plantillas/Serverpic.h_`);                                         //Establecemos el path de la plantilla Serverpic
    let oServerpicTexto = await vscode.workspace.openTextDocument(uriServerpic);                                                    //Cargamos la plantilla Serverpic
    let ServerpicTexto = ((await oServerpicTexto).getText());           													  //Extraemos el texto de la plantilla	
	ServerpicTexto = ServerpicTexto.split('#Placa#').join(oJson.placa); 															  //Hacemos los remplazos pertinentes 	
	ServerpicTexto = ServerpicTexto.split('#Modelo#').join(oJson.Modelo);
	ServerpicTexto = ServerpicTexto.split('#Dispositivo#').join(oJson.folder);
	ServerpicTexto = ServerpicTexto.split('#Fecha#').join(Fecha);
	ServerpicTexto = ServerpicTexto.split('#Ino#').join(oJson.folder);    
	ServerpicTexto = ServerpicTexto.split('#Core#').join(oJson.version); 
	var uriLibrerias;
	switch (oJson.plataforma) {
		case 'esp8266':
			uriLibrerias = vscode.Uri.file(`${cPathExtension}/Plantillas/includeesp8266.h`);
			break;
		case 'esp32':
			uriLibrerias = vscode.Uri.file(`${cPathExtension}/Plantillas/includeesp32.h`);
			break;
		case 'Heltec-esp32':
			uriLibrerias = vscode.Uri.file(`${cPathExtension}/Plantillas/includeHeltec-esp32.h`);
			break;
	}
	let oServerpicLib = await vscode.workspace.openTextDocument(uriLibrerias);
	let ServerpicLibTexto =  ((await oServerpicLib).getText()); 
	ServerpicTexto =    (ServerpicTexto.toString()).replace('#includes#', ServerpicLibTexto );                                                  
	we.insert(Serverpic, new vscode.Position(0, 0), ServerpicTexto);                                                           //Grabamos la informacion en Serverpic.h
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');         
    return(Serverpic);
}        
/**************************
* Funcion que crea el fichero ino
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
* @param Retorna el puntero al fichero
*/
async function CreaIno ()
{    
    let Ino = vscode.Uri.parse(`${cPathProyecto}/${oJson.folder}.ino`);
    we.createFile(Ino, { ignoreIfExists: false, overwrite: true });
    let uriIno = vscode.Uri.file(`${cPathExtension}/Plantillas/Ino.in_`);                                                    //Establecemos el path de la plantilla TeamCity
	let oInoTexto = vscode.workspace.openTextDocument(uriIno);                                                                //Cargamos la plantilla TeamCity
	let InoTexto = ((await oInoTexto).getText());                                                                             //Extraemos el texto de la plantilla   
	InoTexto = InoTexto.split('#Dispositivo#').join(oJson.folder);                                                          //Hacemos los remplazos pertinentes
	InoTexto = InoTexto.split('#Fecha#').join(Fecha); 
	we.insert(Ino, new vscode.Position(0, 0), InoTexto);                                                                       //Grabamos la informacion en el prigrama ino
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
    return (Ino);
}

/**************************
* Funcion que crea el fichero boardlist.sh
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
* @param Retorna el puntero al fichero
*/
async function CreaBoardList ()
{
    let Boardlist = vscode.Uri.parse(`${cPathProyecto}/boardlist.sh`);
    we.createFile(Boardlist, { ignoreIfExists: false, overwrite: true });
	let uriBoardlist = vscode.Uri.file(`${cPathExtension}/Plantillas/boardlist.s_`);                                                    //Establecemos el path de la plantilla TeamCity
	let oBoardlistTexto = vscode.workspace.openTextDocument(uriBoardlist);                                                               //Cargamos la plantilla TeamCity
	let BoardlistTexto = ((await oBoardlistTexto).getText());                                                                             //Extraemos el texto de la plantilla    
	BoardlistTexto = BoardlistTexto.split('#Dispositivo#').join(oJson.folder);                                                          //Hacemos los remplazos pertinente
	BoardlistTexto = BoardlistTexto.split('#Fecha#').join(Fecha);
	we.insert(Boardlist, new vscode.Position(0, 0), BoardlistTexto);                                                                       //Grabamos la informacion en el prigrama ino
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    return(Boardlist);
}
/**************************
* Funcion que crea el fichero hardware
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
* @param Retorna el puntero al fichero
*/
async function CreaHardware ()
{
    let Hardware = vscode.Uri.parse(`${cPathProyecto}/hardware`);
    we.createFile(Hardware, { ignoreIfExists: false, overwrite: true });
    we.insert(Hardware, new vscode.Position(0, 0), oJson.placa);
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    return(Hardware);
}
/**************************
* Funcion que crea el fichero Compila
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
* @param Retorna el puntero al fichero
*/
async function CreaCompila ()
{
    let Compila = vscode.Uri.parse(`${cPathProyecto}/Compila.bat`);
    we.createFile(Compila, { ignoreIfExists: false, overwrite: true });
    we.insert(Compila, new vscode.Position(0, 0), `arduino-cli compile -b ${oJson.fqbn}:${oJson.configuration} --build-path %~d0%~p0build -e -v `);
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    return(Compila);
}
/**************************
* Funcion que crea el fichero Compila
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
* @param Retorna el puntero al fichero
*/
async function CreaUpload ()
{
    let Upload = vscode.Uri.parse(`${cPathProyecto}/Upload.bat`);
    we.createFile(Upload, { ignoreIfExists: false, overwrite: true });
    we.insert(Upload, new vscode.Position(0, 0), `arduino-cli upload -p %1 -b ${oJson.fqbn} -i %~d0%~p0build/${oJson.fqbn}/${oJson.folder}.ino.bin `);
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    return(Upload);
}
/**************************
* Funcion que crea el fichero c_cpp_properties.json
*
* @param lWork.- Indica con  1 o 0 si esta en trabajo o en creacion inicial para no cerrar el editor
* Como parametro utiliza la variable global  oJson con el json del proyecto
* @param Retorna el puntero al fichero
*/
async function CreaProperties (lWork)
{
    let Properties = vscode.Uri.parse(`${cPathProyecto}/.vscode/c_cpp_properties.json`);
    we.createFile(Properties, { ignoreIfExists: false, overwrite: true });
 	let uriProperties = vscode.Uri.file(`${cPathExtension}/Plantillas/c_cpp_properties.jso_`);                      //Establecemos el path de la plantilla TeamCity
	let oPropertiesTexto = vscode.workspace.openTextDocument(uriProperties);                                        //Cargamos la plantilla c_cpp_properties
	let PropertiesTexto = ((await oPropertiesTexto).getText());                                                     //Extraemos el texto de la plantilla    
    let cDirUsuario = cUsuario.split('\\').join('/');

	PropertiesTexto = PropertiesTexto.split('#forced#').join(oJson.directorios[0].forced.forced);					//Directorio forcedInclude  almacenado en el json de la plataforma en el que se deben sustituir parametros cuando este en c_cpp_properties
	PropertiesTexto = PropertiesTexto.split('#Dirusuario#').join(cDirUsuario);										//Hacemos las sustituciones pertinentes
	PropertiesTexto = PropertiesTexto.split('#Plataforma#').join(oJson.plataforma);
	PropertiesTexto = PropertiesTexto.split('#Version#').join(oJson.version);
	PropertiesTexto = PropertiesTexto.split('#DirCompilador#').join(oJson.directorios[0].plataforma.dircompilador);
	PropertiesTexto = PropertiesTexto.split('#Compilador#').join(oJson.compilador);
	PropertiesTexto = (PropertiesTexto.toString()).replace('#DirLib#', await Create_Intellisense());
	we.insert(Properties, new vscode.Position(0, 0), PropertiesTexto);                                                                       //Grabamos la informacion en el prigrama ino
	if ( lWork == 0)
	{
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	}
	return(Properties);
}
/**************************
* Funcion que en un directorio del json los parametros #...# por su contenido real 
* 
* Sustituye #usuario#, #version#, #modelo# y #documentos# en la cadena de directorio del json
* por los valores que corresponden a la plataforma y al directorio Documents
*
* @return Devuelve el directorio real
*/
async function ReplaceParamsInPath (cDirectorio)
{
    let cDirUsuario =  cUsuario.split('\\').join('/');
    var cDir = cDirectorio;
	cDir = (cDir.toString()).replace('#usuario#', cDirUsuario);
    cDir = (cDir.toString()).replace('#version#', oJson.version);
	cDir = (cDir.toString()).replace('#modelo#', oJson.modelo);
	cDir = (cDir.toString()).replace('#documentos#', await Generico.ChecDirDocuments());

    return(cDir);
}
/**************************
* Funcion que lee todos los direcotios incluidos en un directorio para obtener todos los direcotrios con librerias 
* @param cDirectorio.- Directorio del que se quiere obtener el listado de directorios
* 
* Devuelve una ceadena con todos los direcorios contenidos en cDirectorio para obtener los directorios de librerias para Intelisense
* Si un directorio, dentro de el contiene una carpeta 'src', en la cadena porne el  patah de la carpeta src, si no tiene
* carpeta 'src', en la cadena pone el path del directorio contenedor
* Todas las lineas de la cadena están tabuladas
* 
* @return Devuelve el listado de directorios contenidos en cDirecotrio
*/
async function ListDirInPath (cDirectorio)
{
	var cDirTot = '';
	var cDirInd = '';

	cDirTot = cDirTot+'\t\t\t\t'+'\"'+(cDirectorio.substring(0, cDirectorio.length - 1))+'\",'+'\n';	//Directorio contenedor
	let files = fs.readdirSync(cDirectorio)																//Leemos el contenido del directorio
	files.forEach(file => {																				//Recorremos el contenido
		cDirInd = cDirectorio+file;																		//Añadimos todo el path al objetivo
		var stat = fs.statSync(cDirInd)																	//Miramos de que tipo es el objetivo 
		if (stat.isDirectory())																			//Si es un directorio
		{
			if (fs.existsSync(cDirInd+'/src'))															//Miramos si en el hay otro directorio src
			{
				cDirTot = cDirTot+'\t\t\t\t'+'\"'+cDirInd+'/src\",'+'\n';								//Si lo hay agragamos el directorio src
			}else{
				cDirTot = cDirTot+'\t\t\t\t'+'\"'+cDirInd+'\",'+'\n';									//Si no, el directorio original
			}
		}
	})
	return (cDirTot);
}    
/**************************
* Funcion que obtiene cada uno de los directorios con librerias del json y crea una cadena 
* con todos los directorios de librerias de esos direcotrios
* 
* Sustituye #usuario#, #version#, #modelo# y #documentos# en la cadena de directorio del json
* por los valores que corresponden a la plataforma y al directorio Documents
*
* @return Devuelve una cadena con todos los directorios con librerias contenidos en lso directorios del json
*/
async function Create_Intellisense ()
{
	var cListaLib = '';

	let claves = Object.values(oJson.directorios[0].librerias);			//Busacmaos los directorios del json
	var cDirectorio;
	for ( let nElelmento = 0;nElelmento<claves.length;nElelmento++)     //Para cada uno de ellos
	{
		cDirectorio = claves[nElelmento];								//Obtenemos el path con parametros funcion de la plataforma
		cDirectorio = await ReplaceParamsInPath(cDirectorio);			//Sustituimos los parametros por sus valores reales
		cListaLib = cListaLib + await ListDirInPath(cDirectorio);		//Obtenemos una cadena con todos los directorios contenidos en ese directorio y se lo añadimos al resultado anterior
	}
	cListaLib = cListaLib.substring(0, cListaLib.length-2); 			//Le quitamos la ultima coma
	return(cListaLib);
} 
/**************************
* Funcion que genera el fichero .vscode/c_cpp_properties.json 
* Esta función es exportada y sirve para crear el fichero una vez creado el proyecto
* ES NECESARIO QUE EXISTA serverpic.json
*/
exports.GeneraPorperties = async function ()
{
	oJson = await JsonServerpic.GetJson();
	var fProperties = 	await CreaProperties (1);
	await vscode.workspace.applyEdit(we);								
	let document = await vscode.workspace.openTextDocument(fProperties); 
	await document.save(); 
}