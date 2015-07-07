import inquirer from 'inquirer';
import ADB from 'adbjs';

export default function fkill() {
  
  let adb = new ADB();
  let devs = adb.devices();

  let error = (msg) => {
    console.log(msg);
    process.exit(0);
  }
  
  let deviceInfo2Phrase = (info) => {
    return [info.model, "-", info.version, "(id:", info.id, ")"].join(" "); 
  }

  let process2Phrase = (process) => {
    return ["PID:", process.pid, "PACKAGE:", process.pkg].join(" ");
  }

  let devices = {};
  let choices = [];
  if(!devs.length) error("No devices available!");
  for(let i=0; i<devs.length;i++) {
    let id = devs[i];
    try { 
      let info = adb.deviceInfo(id);
      devices[id] = info; 
      choices.push({name:deviceInfo2Phrase(info), value:id});
    }catch(e){}
  }
  
  let device_prompt = {
    type: "list", 
    name: "device",
    message: "Choose an Android device",
    choices: choices
  }
  
  let ask_device = () => {
       
    inquirer.prompt(device_prompt, (answer) => {
      let id = answer.device;
      ask_process(id);
    });
  }
  
  let ask_process = (device) => {
    let processList = adb.userProcessList(device);
    let choices = [];
    for(let i=0;i<processList.length;i++) {
      let process = processList[i];
      choices.push({name:process2Phrase(process), value:process.pkg});
    }

    let ps_prompt = {
      type: "list", 
      name: "pkg",
      message: "Choose a process to kill",
      choices: choices
    }
    inquirer.prompt(ps_prompt, (answer) => {
      adb.closeApp(answer.pkg);
    });
  }

  ask_device();
  
}
