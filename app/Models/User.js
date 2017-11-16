'use strict'

const Model = use('Model')

class User extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeSave', 'User.hashPassword')
  }

  tokens () {
    return this.hasMany('App/Models/Token')
  }

}

module.exports = User;
