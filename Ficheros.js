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
* 
*******************************************************/
const { Console } = require("console");
const vscode = require("vscode")
const JsonServerpic = require('./ServerpicJson.js');

const we = new vscode.WorkspaceEdit();

var cPathProyecto;
let Fecha = new Date();
Fecha = Fecha.toLocaleDateString();
const cUsuario = require('os').homedir();
const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`;

var oJson;

exports.SetPathProyecto = async function (cPath)
{
    cPathProyecto = cPath;
}

exports.CreaArchivos = async function (oJsonProyecto)
{
    oJson = oJsonProyecto;
    //await vscode.workspace.applyEdit(we);   
    await CreaIO();
    await CreaTeamCity();
    await CreaServerpicJson();
}

async function CreaIO()
{
    let IO = vscode.Uri.parse(`${cPathProyecto}/IO.h`);
    we.createFile(IO, { ignoreIfExists: false, overwrite: true });
    let uriIO = vscode.Uri.file(`${cPathExtension}/Plantillas/IO.h_`);                                                       //Establecemos el path de la plantilla IO
    let oIOTexto = vscode.workspace.openTextDocument(uriIO);                                                                  //Cargamos la plantilla IO
    let IOTexto = ((await oIOTexto).getText());                                                                               //Extraemos el texto de la plantilla 
    IOTexto = IOTexto.split('#Placa#').join(oJson.placa);   																		  //Hacemos los remplazos pertinentes	
    IOTexto = IOTexto.split('#Dispositivo#').join(oJson.folder); 
    IOTexto = IOTexto.split('#Fecha#').join(Fecha); 
    we.insert(IO, new vscode.Position(0, 0), IOTexto);     
    vscode.commands.executeCommand('workbench.action.closeActiveEditor'); 
    await vscode.workspace.applyEdit(we);
    let document = await vscode.workspace.openTextDocument(IO); 
    await document.save(); 
} 

async function CreaTeamCity ()
{
    let TeamCity = vscode.Uri.parse(`${cPathProyecto}/TeamCity.sh`);
    we.createFile(TeamCity, { ignoreIfExists: false, overwrite: true });
	let uriTeamCity = vscode.Uri.file(`${cPathExtension}/Plantillas/TeamCity.s_`);                                           //Establecemos el path de la plantilla TeamCity
	let oTeamCityTexto = vscode.workspace.openTextDocument(uriTeamCity);                                                      //Cargamos la plantilla TeamCity
	let TeamCityTexto = ((await oTeamCityTexto).getText());                                                                   //Extraemos el texto de la plantilla    
	//TeamCityTexto = (TeamCityTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                  //Hacemos los remplazos pertinentes
	TeamCityTexto = TeamCityTexto.split('#Dispositivo#').join(oJson.folder);;												   //Hacemos los remplazos pertinentes
	we.insert(TeamCity, new vscode.Position(0, 0), TeamCityTexto);                                                             //Grabamos la informacion en TeamCity.sh
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
    await vscode.workspace.applyEdit(we);   
    let document = await vscode.workspace.openTextDocument(TeamCity); 
    await document.save(); 	
}
async function CreaServerpicJson ()
{
    let serverpicjson = vscode.Uri.parse(`${cPathProyecto}/.vscode/serverpic.json`);
    we.createFile(serverpicjson, { ignoreIfExists: false, overwrite: true });
    let DataJson = JSON.stringify(oJson);
    we.insert(serverpicjson, new vscode.Position(0, 0), DataJson);
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
    await vscode.workspace.applyEdit(we);   
    let document = await vscode.workspace.openTextDocument(serverpicjson); 
    await document.save(); 	
}