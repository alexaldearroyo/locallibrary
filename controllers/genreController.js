const { body, validationResult } = require("express-validator");

const asyncHandler = require('express-async-handler'); 
const Genre = require('../models/genre');
const Book = require("../models/book");


// Display list of all Genres.
exports.genre_list = asyncHandler(async (req, res, next) => {
    const allGenres = await Genre.find().sort({ name: 1 }).exec();
    res.render("genre_list", {
      title: "Genre List",
      genre_list: allGenres,
    });
  });
  

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
    // Get details of genre and all associated books (in parallel)
    const [genre, booksInGenre] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);
    if (genre === null) {
      // No results.
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("genre_detail", {
      title: "Genre Detail",
      genre: genre,
      genre_books: booksInGenre,
    });
  });
  

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(genre.url);
      }
    }
  }),
];


// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
  async.parallel({
      genre: (callback) => {
          Genre.findById(req.params.id).exec(callback);
      },
      genre_books: (callback) => {
          Book.find({ 'genre': req.params.id }).exec(callback);
      },
  }, (err, results) => {
      if (err) { return next(err); }
      if (results.genre_books.length > 0) {
          // Hay libros asociados con este género, mostrar la lista de libros y el formulario de confirmación
          res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
          return;
      } else {
          // No hay libros asociados con este género, proceder con la eliminación
          Genre.findByIdAndRemove(req.body.genreid, (err) => {
              if (err) { return next(err); }
              // Éxito: redirigir a la lista de géneros
              res.redirect('/catalog/genres');
          });
      }
  });
};


// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
  async.parallel({
      genre: (callback) => {
          Genre.findById(req.body.genreid).exec(callback);
      },
      genre_books: (callback) => {
          Book.find({ 'genre': req.body.genreid }).exec(callback);
      },
  }, (err, results) => {
      if (err) { return next(err); }
      if (results.genre_books.length > 0) {
          // Hay libros asociados con este género, mostrar la lista de libros y el formulario de confirmación
          res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
          return;
      } else {
          // No hay libros asociados con este género, proceder con la eliminación
          Genre.findByIdAndRemove(req.body.genreid, (err) => {
              if (err) { return next(err); }
              // Éxito: redirigir a la lista de géneros
              res.redirect('/catalog/genres');
          });
      }
  });
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
  Genre.findById(req.params.id).exec((err, genre) => {
      if (err) { return next(err); }
      if (!genre) {
          // No se encontró el género, redirigir a la lista de géneros
          res.redirect('/catalog/genres');
          return;
      }
      // Mostrar el formulario de actualización
      res.render('genre_form', { title: 'Update Genre', genre: genre });
  });
};

// Handle Genre update on POST.
exports.genre_update_post = [
  // Validar y sanear campos
  body('name', 'Genre name must not be empty.').trim().isLength({ min: 1 }).escape(),

  // Procesar la solicitud después de la validación y el saneamiento
  (req, res, next) => {
      const errors = validationResult(req);
      const genre = new Genre({
          _id: req.params.id,
          name: req.body.name,
      });

      if (!errors.isEmpty()) {
          // Hay errores. Volver a mostrar el formulario con valores y mensajes de error
          res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors.array() });
          return;
      } else {
          // Los datos del formulario son válidos. Actualizar el registro del género.
          Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, updatedGenre) => {
              if (err) { return next(err); }
              // Éxito: redirigir al detalle del género actualizado
              res.redirect(updatedGenre.url);
          });
      }
  },
];

