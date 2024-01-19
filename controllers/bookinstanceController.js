const { body, validationResult } = require("express-validator");
const Book = require("../models/book");

const asyncHandler = require('express-async-handler'); 
const BookInstance = require('../models/bookinstance');

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
    const allBookInstances = await BookInstance.find().populate('book').exec();
  
    res.render('bookinstance_list', {
      title: 'Book Instance List',
      bookinstance_list: allBookInstances,
    });
  });

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async function(req, res, next) {
    try {
        const bookinstance = await BookInstance.findById(req.params.id)
            .populate('book')
            .exec();

        if (bookinstance == null) { // No results.
            const err = new Error('Book copy not found');
            err.status = 404;
            return next(err);
        }

        // Successful, so render.
        res.render('bookinstance_detail', { title: 'Copy: ' + bookinstance.book.title, bookinstance: bookinstance });
    } catch (error) {
        return next(error);
    }
};
  

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
  
    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: allBooks,
    });
  });
  

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
    body("imprint", "Imprint must be specified")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
      .optional({ values: "falsy" })
      .isISO8601()
      .toDate(),
  
    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
  
      const bookInstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
      });
  
      if (!errors.isEmpty()) {
        const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
  
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: allBooks,
          selected_book: bookInstance.book._id,
          errors: errors.array(),
          bookinstance: bookInstance,
        });
        return;
      } else {
        await bookInstance.save();
        res.redirect(bookInstance.url);
      }
    }),
  ];
  

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
  async.parallel({
      bookinstance: (callback) => {
          BookInstance.findById(req.params.id).exec(callback);
      },
  }, (err, results) => {
      if (err) { return next(err); }
      if (!results.bookinstance) {
          // No se encontró la instancia de libro, redirigir a la lista de instancias de libros
          res.redirect('/catalog/bookinstances');
          return;
      }
      // Mostrar la página de confirmación de eliminación
      res.render('bookinstance_delete', { title: 'Delete BookInstance', bookinstance: results.bookinstance });
  });
};


// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
  async.parallel({
      bookinstance: (callback) => {
          BookInstance.findById(req.body.bookinstanceid).exec(callback);
      },
  }, (err, results) => {
      if (err) { return next(err); }
      if (!results.bookinstance) {
          // No se encontró la instancia de libro, redirigir a la lista de instancias de libros
          res.redirect('/catalog/bookinstances');
          return;
      }
      // Eliminar la instancia de libro
      BookInstance.findByIdAndRemove(req.body.bookinstanceid, (err) => {
          if (err) { return next(err); }
          // Éxito: redirigir a la lista de instancias de libros
          res.redirect('/catalog/bookinstances');
      });
  });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id);
    const allBooks = await Book.find({}, 'title');
    
    if (!bookInstance) {
      const err = new Error('BookInstance not found');
      err.status = 404;
      return next(err);
    }

    res.render('bookinstance_form', {
      title: 'Update BookInstance',
      bookinstance: bookInstance,
      book_list: allBooks,
    });
  } catch (err) {
    return next(err);
  }
};

// Handle BookInstance update on POST.
exports.bookinstance_update_post = [
  // Validate and sanitize fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),
  body('due_back', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const bookInstance = new BookInstance({
        _id: req.params.id,
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
      });

      if (!errors.isEmpty()) {
        const allBooks = await Book.find({}, 'title');
        res.render('bookinstance_form', {
          title: 'Update BookInstance',
          bookinstance: bookInstance,
          book_list: allBooks,
          errors: errors.array(),
        });
      } else {
        await BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {});
        res.redirect(bookInstance.url);
      }
    } catch (err) {
      return next(err);
    }
  },
];
