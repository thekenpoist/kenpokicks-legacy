'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.js'))[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const User = require('./userModel')(sequelize, Sequelize.DataTypes);
db.User = User;

const Technique = require('./techniqueModel')(sequelize, Sequelize.DataTypes);
db.Technique = Technique;

const Belt = require('./beltModel')(sequelize, Sequelize.DataTypes);
db.Belt = Belt;

const TrainingLog = require('./trainingLogModel')(sequelize, Sequelize.DataTypes);
db.TrainingLog = TrainingLog;

const AdminLog = require('./adminLogModel')(sequelize, Sequelize.DataTypes);
db.AdminLog = AdminLog;

const SiteAccess = require('./siteAccessModel')(sequelize, Sequelize.DataTypes);
db.SiteAccess = SiteAccess;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
