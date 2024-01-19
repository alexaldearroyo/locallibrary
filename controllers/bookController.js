const { body, validationResult } = require("express-validator");

const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const asyncHandler = require('express-async-handler');

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, "title author")
      .sort({ title: 1 })
      .populate("author")
      .exec();
  
    res.render("book_list", { title: "Book List", book_list: allBooks });
  });
  

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
    // Get details of books, book instances for specific book
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id).populate("author").populate("genre").exec(),
      BookInstance.find({ book: req.params.id }).exec(),
    ]);
  
    if (book === null) {
      // No results.
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("book_detail", {
      title: book.title,
      book: book,
      book_instances: bookInstances,
    });
  });
  

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  const [allAuthors, allGenres] = await Promise.all([
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  res.render("book_form", {
    title: "Create Book",
    authors: allAuthors,
    genres: allGenres,
  });
});


// Handle book create on POST.
exports.book_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      for (const genre of allGenres) {
        if (book.genre.includes(genre._id.toString())) {
          genre.checked = "true";
        }
      }
      res.render("book_form", {
        title: "Create Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
    } else {
      await book.save();
      res.redirect(book.url);
    }
  }),
];


// Display book delete form on GET.
exports.book_delete_get = (req, res, next) => {
  async.parallel({
      book: (callback) => {
          Book.findById(req.params.id).exec(callback);
      },
      book_instances: (callback) => {
          BookInstance.find({ 'book': req.params.id }).exec(callback);
      },
  }, (err, results) => {
      if (err) { return next(err); }
      if (results.book_instances.length > 0) {
          // Hay instancias de libros asociadas con este libro, mostrar la lista de instancias de libros y el formulario de confirmación
          res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_instances });
          return;
      } else {
          // No hay instancias de libros asociadas con este libro, proceder con la eliminación
          Book.findByIdAndRemove(req.body.bookid, (err) => {
              if (err) { return next(err); }
              // Éxito: redirigir a la lista de libros
              res.redirect('/catalog/books');
          });
      }
  });
};


// Handle book delete on POST.
exports.book_delete_post = (req, res, next) => {
  async.parallel({
      book: (callback) => {
          Book.findById(req.body.bookid).exec(callback);
      },
      book_instances: (callback) => {
          BookInstance.find({ 'book': req.body.bookid }).exec(callback);
      },
  }, (err, results) => {
      if (err) { return next(err); }
      if (results.book_instances.length > 0) {
          // Hay instancias de libros asociadas con este libro, mostrar la lista de instancias de libros y el formulario de confirmación
          res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_instances });
          return;
      } else {
          // No hay instancias de libros asociadas con este libro, proceder con la eliminación
          Book.findByIdAndRemove(req.body.bookid, (err) => {
              if (err) { return next(err); }
              // Éxito: redirigir a la lista de libros
              res.redirect('/catalog/books');
          });
      }
  });
};


// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  const [book, allAuthors, allGenres] = await Promise.all([
    Book.findById(req.params.id).populate("author").exec(),
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  if (book === null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  allGenres.forEach((genre) => {
    if (book.genre.includes(genre._id)) genre.checked = "true";
  });

  res.render("book_form", {
    title: "Update Book",
    authors: allAuthors,
    genres: allGenres,
    book: book,
  });
});


// Handle book update on POST.
exports.book_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      for (const genre of allGenres) {
        if (book.genre.indexOf(genre._id) > -1) {
          genre.checked = "true";
        }
      }
      res.render("book_form", {
        title: "Update Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedBook = await Book.findByIdAndUpdate(req.params.id, book, {});
      res.redirect(updatedBook.url);
    }
  }),
];


exports.book_list = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, 'title author')
        .sort({ title: 1 })
        .populate('author')
        .exec();

    res.render('book_list', { title: 'Book List', book_list: allBooks });
});

// Index page of book catalog
exports.index = asyncHandler(async (req, res, next) => {
    const numBooks = Book.countDocuments({});
    const numBookInstances = BookInstance.countDocuments({});
    const numAvailableBookInstances = BookInstance.countDocuments({ status: 'Available' });
    const numAuthors = Author.countDocuments({});
    const numGenres = Genre.countDocuments({});
  
    const [bookCount, bookInstanceCount, availableBookInstanceCount, authorCount, genreCount] = await Promise.all([
      numBooks, numBookInstances, numAvailableBookInstances, numAuthors, numGenres
    ]);
  
    res.render('index', {
      title: 'Local Library Home',
      book_count: bookCount,
      book_instance_count: bookInstanceCount,
      book_instance_available_count: availableBookInstanceCount,
      author_count: authorCount,
      genre_count: genreCount
    });
  });
  