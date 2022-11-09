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
const vscode = require("vscode");
const we = new vscode.WorkspaceEdit();

var cPathProyecto;
let Fecha = new Date();
Fecha = Fecha.toLocaleDateString();
const cUsuario = require('os').homedir();
const cPathExtension = `${cUsuario}\\.vscode\\extensions\\serverpic`;

var oJson;

/**************************
* Funcion que transforma path de dirextorio en path para file
* cambi %20 por espacio, %3A por : .....
* @param cDirectorio.- Nombre del directorio que se quiere convertir
*
* @return.- Devuelve el path del file
*/
function PathDirToFile ( cDirectorio )
{
	cPath = cDirectorio.split(':').join('%3A');
	cPath = cPath.split(' ').join('%20');
	var cPath = 'file:///'+cPath;
	return (cPath);
}
/**************************
* Funcion que crea los distintos ficheros del proyecto
* 
* utiliza .vscode/serverpic.json
* Esa configuracion se almacena en .vscode/serverpic.json
*/
exports.CreaArchivos = async function (oServerpicJson)
{
    oJson = oServerpicJson;
    cPathProyecto = oJson.directorios[0].trabajo.dirtrabajo;
    cPathProyecto = PathDirToFile(cPathProyecto);

     var aFicheros = []

    //await vscode.workspace.applyEdit(we);   

    aFicheros.push(await CreaIO());
    aFicheros.push(await CreaTeamCity());
    aFicheros.push(await CreaServerpic());
    aFicheros.push(await CreaIno());  
    aFicheros.push(await CreaBoardList());
    aFicheros.push(await CreaHardware());
    aFicheros.push(await CreaCompila());
    aFicheros.push(await CreaUpload());

await vscode.workspace.applyEdit(we);
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
* Funcion que crea el fichero boardlist.sh
*
* Como parametro utiliza la variable global  oJson con el json del proyecto
* @param Retorna el puntero al fichero
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
    return(Properties);
}