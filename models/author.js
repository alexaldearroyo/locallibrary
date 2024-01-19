const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

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

AuthorSchema.virtual("lifespan").get(function () {
  const formatDate = (date) => {
      return date ? DateTime.fromJSDate(date).setLocale('en').toLocaleString(DateTime.DATE_SHORT) : '';
  };

  let birth = formatDate(this.date_of_birth);
  let death = formatDate(this.date_of_death);
  return (birth || death) ? `${birth} - ${death}` : 'Unknown';
});


AuthorSchema.virtual('url')
.get(function () {
    return '/catalog/author/' + this._id;
});

module.exports = mongoose.model('Author', AuthorSchema);
