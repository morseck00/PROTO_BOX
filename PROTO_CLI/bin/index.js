#!/usr/bin/env node
const chalk       = require('chalk')
const inquirer    = require('inquirer')
const figlet      = require('figlet')
const clear       = require('clear')
const fs          = require('fs')
const exec        = require('child_process').exec
const Promise     = require('bluebird')
var replace       = require('replace')

//Function qui Affiche l'entête du nom du Programme
function enteteproject () {
  clear()
  console.log(
    chalk.green(figlet.textSync('PROTO-BOX', { horizontalLayout: 'fitted' }))
  )
  console.log(
    chalk.yellow(
      '                                              by ILAB SONATEL'
    )
  )
  console.log(chalk.green('Bienvenue dans la CLI de Proto-Box \n'))
}

//question pour donner un nom au projet
const nameproject = {
  type   : 'input',
  name   : 'projectName',
  message: 'Veuiller mettre le nom du projet',
  default: 'Protobox',
  validate: input => {
    return new Promise((resolve, reject) => {
      if (!input.length) {
        reject('Veuillez mettre le nom du projet')
      }
      resolve(true)
    })
  }
}

function creerunrepertoir (nomprojet) {
  try {
    fs.mkdirSync(nomprojet)
  } catch (error) {
    console.log('Erreur lors de la création du repertoire')
  }
}

//question pour que l'utilisateur choisi les focntionnalités qu'il veux implémenter
const fonctionnalites = {
  type   : 'checkbox',
  name   : 'fonctionnalites',
  message: 'Veuiller selectionner une fonctionnalité SVP: \n',
  choices: [
    'Authentication',
    'File Upload',
    'Email Sending',
    'Contact Form',
    'Pdf Generator',
    'Crud',
    'Registration'
  ],
  validate: checkbox => {
    return new Promise((resolve, reject) => {
      if (!checkbox.length) {
        reject('Veuiller selectionner une fonctionnalité SVP')
      }
      resolve(true)
    })
  }
}

//questions sur les propriétes
const nomEntite = {
  type   : 'input',
  name   : 'entityName',
  message: 'Veuillez mettre le nom entité',
  validate: input => {
    return new Promise((resolve, reject) => {
      if (!input.length) {
        reject('Veuillez mettre le nom entité')
      }
      resolve(true)
    })
  }
}

const attributeadd = {
  type   : 'input',
  name   : 'attributeaddname',
  message: 
    'Votre entité a déjà comme attribut email et password.\nVoullez-vous ajouter des attributs ?\nTapper Entrer ou sur n pour dire non (O/n)',
  default: 'O'
}

const attributeName = {
  type   : 'String',
  name   : 'attributename_name',
  message: "Nom de l'attribut"
}

const attributeType = {
  name   : 'type',
  type   : 'list',
  message: 'What is the type of your attribute ?',
  choices: [String, 'int', Number, 'password'],
  validate: function (value) {
    if (value.length) {
      return true
    } else {
      return 'Please choose a type'
    }
  }
}

const attributeRequire = {
  name   : 'require',
  type   : 'input',
  message: "l'attribut est-il obligatoire ? (True /False)",
  default: false
}

const attributeunique = {
  name   : 'unique',
  type   : 'input',
  message: "l'attribut doit-il être unique ? (True /False)",
  default: false
}
//------------Fonction pour créer un fichier-----------------//
function creerunfichier (fichier, data) {
  fs.appendFile(fichier, data, err => {
    if (err) throw err
  })
}

;(async () => {
  enteteproject()
  const np = await inquirer.prompt(nameproject)
  const f  = await inquirer.prompt(fonctionnalites)

  for (let i = 0; i < f.fonctionnalites.length; i++) {
    if (f.fonctionnalites[i] == 'Authentication') {
      console.log(
        "Veuillez mettre le nom de l'entité pour la fonctionnalité " +
          f.fonctionnalites[i]
      )
      creerunrepertoir(np.projectName)

      //-------Chargement de la fonctionnalité
      exec('svn checkout https://github.com/morseck00/PROTO_BOX/trunk/Authentication',{
          cwd: './' + np.projectName
      }
      )
      const ne  = await inquirer.prompt(nomEntite)
      const ad  = await inquirer.prompt(attributeadd)
      const rep = ad.attributeaddname

      //-------bracket pour commencé le fichier yml
     
      let ouverture = ""
      creerunfichier('./' +np.projectName +'/Authentication/routes/propriety.js',ouverture)
      creerunfichier('./' +np.projectName +'/Authentication/models/data.js',ouverture)
     
    
      while (rep == 'O') {
        const an  = await inquirer.prompt(attributeName)
        const at  = await inquirer.prompt(attributeType)
        const re  = await inquirer.prompt(attributeRequire)
        const au  = await inquirer.prompt(attributeunique)
        const ad2 = await inquirer.prompt(attributeadd)

        
        let datapropriety=",'"+an.attributename_name+"'"
        creerunfichier('./' +np.projectName +'/Authentication/routes/propriety.js',datapropriety)     
       
        let data ='\n'+an.attributename_name +': { type: ' +at.type +',required: ' +re.require +', unique: ' +au.unique +'},\n'

        creerunfichier('./' +np.projectName +'/Authentication/models/data.js',data)        
        //creerunfichier('./' +np.projectName +'/Authentication/routes/propriety.js',datapropriety)        

        if (ad2.attributeaddname == 'n') {
          let datapropriety=""
          creerunfichier('./' +np.projectName +'/Authentication/routes/propriety.js',datapropriety)  
          break;
        }
      }

      //-------bracket pour fermer le fichier yml
      let fermerproprietes = "]}\nmodule.exports.propriety=propriety;"
      let fermer = "}\n module.exports.data=data;"
      creerunfichier('./' +np.projectName +'/Authentication/models/data.js',fermer)
      creerunfichier('./' +np.projectName +'/Authentication/routes/propriety.js',fermerproprietes)    
    
      replace({
        regex      :'user',
        replacement: ne.entityName,
        paths: [
          './' + np.projectName + '/Authentication/routes/routefile.js',
          './' + np.projectName + '/Authentication/models/models.js',
          './' + np.projectName + '/Authentication/middleware/auth.js',
          './' + np.projectName + '/Authentication/server.js',
        ],
        recursive: true,
        silent   : true
      });

      replace({
        regex      :'User',
        replacement: ne.entityName.charAt(0).toUpperCase() + ne.entityName.substring(1).toLowerCase(),
        paths: [
          './' + np.projectName + '/Authentication/routes/routefile.js',
          './' + np.projectName + '/Authentication/models/models.js',
          './' + np.projectName + '/Authentication/middleware/auth.js',
        ],
        recursive: true,
        silent   : true
      });
      
      exec('npm install ',{
          cwd: './' + np.projectName + '/Authentication'
      });
  
      
    }
  }
  
})()
