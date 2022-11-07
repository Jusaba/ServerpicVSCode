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

/**************************
* Funcion que asigna al modulo de ficheros el path del proyecto
* 
* @param cPath.- Path del proyectto
*/
exports.SetPathProyecto = async function (cPath)
{
    cPathProyecto = cPath;
}
/**************************
* Funcion que crea los distintos ficheros del proyecto
* 
* @param oJsonProyecto.- Json con la configuracion del proyecto
* Esa configuracion se almacena en .vscode/serverpic.json
*/
exports.CreaArchivos = async function (oJsonProyecto)
{
    oJson = oJsonProyecto;
    console.log ('--------------');
    console.log (oJson);
    //await vscode.workspace.applyEdit(we);   
    await CreaIO();
    await CreaTeamCity();
    await CreaServerpicJson();
    await CreaServerpic();
    await CreaIno();
    await CreaBoardList();
    await CreaHardware();
    await CreaCompila();
    await CreaUpload();
}
/**************************
* Funcion que crea el fichero IO.h
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
*/
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
/**************************
* Funcion que crea el fichero TeamCity.sh
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
*/
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
/**************************
* Funcion que crea el fichero .vscode/serverpic.json
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
*/
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
/**************************
* Funcion que crea el fichero Serverpic.h
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
*/
//-------------------
async function CreaServerpic ()
{
 
    let Serverpic = vscode.Uri.parse(`${cPathProyecto}/Serverpic.h`);
    we.createFile(Serverpic, { ignoreIfExists: false, overwrite: true });
    let uriServerpic = vscode.Uri.file(`${cPathExtension}/Plantillas/Serverpic.h_`);                                         //Establecemos el path de la plantilla Serverpic
    let oServerpicTexto = vscode.workspace.openTextDocument(uriServerpic);                                                    //Cargamos la plantilla Serverpic
    let ServerpicTexto = ((await oServerpicTexto).getText());           													  //Extraemos el texto de la plantilla	
	ServerpicTexto = ServerpicTexto.split('#Placa#').join(oJson.placa); 															  //Hacemos los remplazos pertinentes 	
	ServerpicTexto = ServerpicTexto.split('#Modelo#').join(oJson.Modelo);
	ServerpicTexto = ServerpicTexto.split('#Dispositivo#').join(oJson.folder);
	ServerpicTexto = ServerpicTexto.split('#Fecha#').join(Fecha);
	ServerpicTexto = ServerpicTexto.split('#Ino#').join(oJson.folder);    
	ServerpicTexto = ServerpicTexto.split('#Core#').join(oJson.version);                                                      
	we.insert(Serverpic, new vscode.Position(0, 0), ServerpicTexto);                                                           //Grabamos la informacion en Serverpic.h
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');         
    await vscode.workspace.applyEdit(we);   
    let document = await vscode.workspace.openTextDocument(Serverpic); 
    await document.save(); 	
}        
/**************************
* Funcion que crea el fichero ino
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
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
	//InoTexto = (InoTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                           //Hacemos los remplazos pertinentes
	//InoTexto = (InoTexto.toString()).replace('#Dispositivo#', `${newReactFolder}`);                                           
	//InoTexto = (InoTexto.toString()).replace('#Fecha#', `${Fecha}`);
	we.insert(Ino, new vscode.Position(0, 0), InoTexto);                                                                       //Grabamos la informacion en el prigrama ino
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');                                                     //Cerramos el fichero abierto en workspace
    await vscode.workspace.applyEdit(we);   
    let document = await vscode.workspace.openTextDocument(Ino); 
    await document.save(); 	

}

/**************************
* Funcion que crea el fichero boardlist.sh
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
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
    await vscode.workspace.applyEdit(we);  
    let document = await vscode.workspace.openTextDocument(Boardlist); 
    await document.save(); 	
}
/**************************
* Funcion que crea el fichero hardware
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
*/
async function CreaHardware ()
{
    let Hardware = vscode.Uri.parse(`${cPathProyecto}/hardware`);
    we.createFile(Hardware, { ignoreIfExists: false, overwrite: true });
    we.insert(Hardware, new vscode.Position(0, 0), oJson.placa);
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    await vscode.workspace.applyEdit(we);
    let document = await vscode.workspace.openTextDocument(Hardware); 
    await document.save(); 	
}
/**************************
* Funcion que crea el fichero Compila
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
*/
async function CreaCompila ()
{
    let Compila = vscode.Uri.parse(`${cPathProyecto}/Compila.bat`);
    we.createFile(Compila, { ignoreIfExists: false, overwrite: true });
    we.insert(Compila, new vscode.Position(0, 0), `arduino-cli compile -b ${oJson.fqbn}:${oJson.configuration} --build-path %~d0%~p0build -e -v `);
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    await vscode.workspace.applyEdit(we);
    let document = await vscode.workspace.openTextDocument(Compila); 
    await document.save(); 	
}
/**************************
* Funcion que crea el fichero Compila
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
*/
async function CreaUpload ()
{
    let Upload = vscode.Uri.parse(`${cPathProyecto}/Upload.bat`);
    we.createFile(Upload, { ignoreIfExists: false, overwrite: true });
    we.insert(Upload, new vscode.Position(0, 0), `arduino-cli upload -p %1 -b ${oJson.fqbn} -i %~d0%~p0build/${oJson.fqbn}/${oJson.folder}.ino.bin `);
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    await vscode.workspace.applyEdit(we);
    let document = await vscode.workspace.openTextDocument(Upload); 
    await document.save(); 	
}
/**************************
* Funcion que crea el fichero boardlist.sh
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
*/
async function CreaProperties ()
{
    let Properties = vscode.Uri.parse(`${cPathProyecto}/.vscode/c_cpp_properties.json`);
    we.createFile(Properties, { ignoreIfExists: false, overwrite: true });
	let uriProperties = vscode.Uri.file(`${cPathExtension}/Plantillas/c_cpp_properties.js_`);                                                    //Establecemos el path de la plantilla TeamCity
	let oPropertiesTexto = vscode.workspace.openTextDocument(uriProperties);                                                               //Cargamos la plantilla TeamCity
	let PropertiesTexto = ((await oPropertiesTexto).getText());                                                                             //Extraemos el texto de la plantilla    


    we.insert(Properties, new vscode.Position(0, 0), PropertiesTexto);                                                                       //Grabamos la informacion en el prigrama ino
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    await vscode.workspace.applyEdit(we);  
    let document = await vscode.workspace.openTextDocument(Properties); 
    await document.save(); 	
}