// En /controllers/bookinstanceController.js
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
exports.bookinstance_create_get = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance create GET');
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance create POST');
};

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle BookInstance update on POST.
exports.bookinstance_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};
