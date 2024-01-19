const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
  });
  
  AuthorSchema
  .virtual('name')
  .get(function () {
    return this.family_name + ', ' + this.first_name;
  });

  AuthorSchema
  .virtual('lifespan')
  .get(function () {
    let lifetime_string = '';
    if (this.date_of_birth) {
        lifetime_string = this.date_of_birth.getFullYear().toString();
    }
    lifetime_string += ' - ';
    if (this.date_of_death) {
      lifetime_string += this.date_of_death.getYear()
    }
    return lifetime_string;
  });


  module.exports = mongoose.model('Author', AuthorSchema);
