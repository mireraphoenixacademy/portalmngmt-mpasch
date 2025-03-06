document.addEventListener('DOMContentLoaded', () => {
    // Plain text credentials
    const USERNAME = 'mpaAdmin';
    const PASSWORD = 'sysAdmin368';

    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const mainApp = document.getElementById('mainApp');
    const logoutBtn = document.getElementById('logoutBtn');
    const transferRequestsInput = document.getElementById('transferRequests');

    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        loginModal.style.display = 'none';
        mainApp.style.display = 'block';
    } else {
        loginModal.style.display = 'block';
        mainApp.style.display = 'none';
    }

    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === USERNAME && password === PASSWORD) {
            localStorage.setItem('isLoggedIn', 'true');
            loginModal.style.display = 'none';
            mainApp.style.display = 'block';
        } else {
            alert('Invalid credentials');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        loginModal.style.display = 'block';
        mainApp.style.display = 'none';
    });

    // Save Transfer Requests
    transferRequestsInput.addEventListener('change', () => {
        localStorage.setItem('transferRequests', transferRequestsInput.value);
    });

    // Load Transfer Requests
    const savedTransferRequests = localStorage.getItem('transferRequests');
    if (savedTransferRequests) {
        transferRequestsInput.value = savedTransferRequests;
    }

    // Existing variables
    const learners = JSON.parse(localStorage.getItem('learners')) || [];
    const fees = JSON.parse(localStorage.getItem('fees')) || [];
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const classBooks = JSON.parse(localStorage.getItem('classBooks')) || [];
    const addLearnerBtn = document.querySelector('.add-learner-btn');
    const addFeeBtn = document.querySelector('.add-fee-btn');
    const addBookBtn = document.querySelector('.add-book-btn');
    const addClassBookBtn = document.querySelector('.add-class-book-btn');
    const addLearnerForm = document.getElementById('addLearnerForm');
    const addFeeForm = document.getElementById('addFeeForm');
    const addBookForm = document.getElementById('addBookForm');
    const addClassBookForm = document.getElementById('addClassBookForm');
    const editLearnerForm = document.getElementById('editLearnerForm');
    const editFeeForm = document.getElementById('editFeeForm');
    const editBookForm = document.getElementById('editBookForm');
    const editClassBookForm = document.getElementById('editClassBookForm');
    const learnerForm = document.getElementById('learnerForm');
    const editLearnerFormElement = document.getElementById('editLearnerFormElement');
    const feeForm = document.getElementById('feeForm');
    const editFeeFormElement = document.getElementById('editFeeFormElement');
    const bookForm = document.getElementById('bookForm');
    const editBookFormElement = document.getElementById('editBookFormElement');
    const classBookForm = document.getElementById('classBookForm');
    const editClassBookFormElement = document.getElementById('editClassBookFormElement');
    const learnersBody = document.getElementById('learnersBody');
    const feesBody = document.getElementById('feesBody');
    const booksBody = document.getElementById('booksBody');
    const classBooksBody = document.getElementById('classBooksBody');
    let currentPage = 1;
    const entriesPerPage = 10;

    // Generate next admission number
    function getNextAdmissionNo() {
        const maxAdmission = learners.reduce((max, learner) => {
            const num = parseInt(learner.admissionNo.replace('MPA-', ''));
            return num > max ? num : max;
        }, 0);
        return `MPA-${String(maxAdmission + 1).padStart(3, '0')}`;
    }

    // Render Learners
    function renderLearners() {
        learnersBody.innerHTML = '';
        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;
        const paginatedLearners = learners.slice(start, end);

        paginatedLearners.forEach((learner, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${learner.admissionNo}</td>
                <td>${learner.fullName}</td>
                <td>${learner.gender}</td>
                <td>${learner.dob}</td>
                <td>
                    <button onclick="editLearner(${start + index})">Edit</button>
                    <button onclick="deleteLearner(${start + index})">Delete</button>
                </td>
            `;
            learnersBody.appendChild(row);
        });

        document.getElementById('pageInfo').textContent = `Showing ${start + 1} to ${Math.min(end, learners.length)} of ${learners.length} entries`;
    }

    // Render Fees
    function renderFees() {
        feesBody.innerHTML = '';
        fees.forEach((fee, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fee.admissionNo}</td>
                <td>${learners.find(l => l.admissionNo === fee.admissionNo)?.fullName || 'N/A'}</td>
                <td>${fee.term}</td>
                <td>${fee.amountPaid}</td>
                <td>${fee.balance}</td>
                <td>
                    <button onclick="editFee(${index})">Edit</button>
                    <button onclick="deleteFee(${index})">Delete</button>
                </td>
            `;
            feesBody.appendChild(row);
        });
    }

    // Render Books (Admin)
    function renderBooks() {
        booksBody.innerHTML = '';
        books.forEach((book, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.admissionNo}</td>
                <td>${learners.find(l => l.admissionNo === book.admissionNo)?.fullName || 'N/A'}</td>
                <td>${book.subject}</td>
                <td>${book.bookTitle}</td>
                <td>
                    <button onclick="editBook(${index})">Edit</button>
                    <button onclick="deleteBook(${index})">Delete</button>
                </td>
            `;
            booksBody.appendChild(row);
        });
    }

    // Render Class Books (Librarian/Teachers)
    function renderClassBooks() {
        classBooksBody.innerHTML = '';
        classBooks.forEach((book, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.bookNumber}</td>
                <td>${book.subject}</td>
                <td>${book.description}</td>
                <td>${book.totalBooks}</td>
                <td>
                    <button onclick="editClassBook(${index})">Edit</button>
                    <button onclick="deleteClassBook(${index})">Delete</button>
                </td>
            `;
            classBooksBody.appendChild(row);
        });
    }

    // Add Learner
    addLearnerBtn.addEventListener('click', () => {
        addLearnerForm.style.display = 'block';
    });

    learnerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const learner = {
            admissionNo: getNextAdmissionNo(),
            fullName: document.getElementById('fullName').value,
            gender: document.getElementById('gender').value,
            dob: document.getElementById('dob').value
        };
        learners.push(learner);
        localStorage.setItem('learners', JSON.stringify(learners));
        learnerForm.reset();
        addLearnerForm.style.display = 'none';
        renderLearners();
    });

    // Edit Learner
    window.editLearner = (index) => {
        const learner = learners[index];
        document.getElementById('editLearnerIndex').value = index;
        document.getElementById('editFullName').value = learner.fullName;
        document.getElementById('editGender').value = learner.gender;
        document.getElementById('editDob').value = learner.dob;
        editLearnerForm.style.display = 'block';
    };

    editLearnerFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = document.getElementById('editLearnerIndex').value;
        learners[index] = {
            admissionNo: learners[index].admissionNo,
            fullName: document.getElementById('editFullName').value,
            gender: document.getElementById('editGender').value,
            dob: document.getElementById('editDob').value
        };
        localStorage.setItem('learners', JSON.stringify(learners));
        editLearnerForm.style.display = 'none';
        renderLearners();
    });

    // Add Fee
    addFeeBtn.addEventListener('click', () => {
        document.getElementById('feeAdmissionNo').innerHTML = learners.map(l => `<option value="${l.admissionNo}">${l.admissionNo} - ${l.fullName}</option>`).join('');
        addFeeForm.style.display = 'block';
    });

    feeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fee = {
            admissionNo: document.getElementById('feeAdmissionNo').value,
            term: document.getElementById('term').value,
            amountPaid: document.getElementById('amountPaid').value,
            balance: document.getElementById('balance').value
        };
        fees.push(fee);
        localStorage.setItem('fees', JSON.stringify(fees));
        feeForm.reset();
        addFeeForm.style.display = 'none';
        renderFees();
    });

    // Edit Fee
    window.editFee = (index) => {
        const fee = fees[index];
        document.getElementById('editFeeIndex').value = index;
        document.getElementById('editFeeAdmissionNo').innerHTML = learners.map(l => `<option value="${l.admissionNo}" ${l.admissionNo === fee.admissionNo ? 'selected' : ''}>${l.admissionNo} - ${l.fullName}</option>`).join('');
        document.getElementById('editTerm').value = fee.term;
        document.getElementById('editAmountPaid').value = fee.amountPaid;
        document.getElementById('editBalance').value = fee.balance;
        editFeeForm.style.display = 'block';
    };

    editFeeFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = document.getElementById('editFeeIndex').value;
        fees[index] = {
            admissionNo: document.getElementById('editFeeAdmissionNo').value,
            term: document.getElementById('editTerm').value,
            amountPaid: document.getElementById('editAmountPaid').value,
            balance: document.getElementById('editBalance').value
        };
        localStorage.setItem('fees', JSON.stringify(fees));
        editFeeForm.style.display = 'none';
        renderFees();
    });

    // Add Book
    addBookBtn.addEventListener('click', () => {
        document.getElementById('bookAdmissionNo').innerHTML = learners.map(l => `<option value="${l.admissionNo}">${l.admissionNo} - ${l.fullName}</option>`).join('');
        addBookForm.style.display = 'block';
    });

    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const book = {
            admissionNo: document.getElementById('bookAdmissionNo').value,
            subject: document.getElementById('subject').value,
            bookTitle: document.getElementById('bookTitle').value
        };
        books.push(book);
        localStorage.setItem('books', JSON.stringify(books));
        bookForm.reset();
        addBookForm.style.display = 'none';
        renderBooks();
    });

    // Edit Book
    window.editBook = (index) => {
        const book = books[index];
        document.getElementById('editBookIndex').value = index;
        document.getElementById('editBookAdmissionNo').innerHTML = learners.map(l => `<option value="${l.admissionNo}" ${l.admissionNo === book.admissionNo ? 'selected' : ''}>${l.admissionNo} - ${l.fullName}</option>`).join('');
        document.getElementById('editSubject').value = book.subject;
        document.getElementById('editBookTitle').value = book.bookTitle;
        editBookForm.style.display = 'block';
    };

    editBookFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = document.getElementById('editBookIndex').value;
        books[index] = {
            admissionNo: document.getElementById('editBookAdmissionNo').value,
            subject: document.getElementById('editSubject').value,
            bookTitle: document.getElementById('editBookTitle').value
        };
        localStorage.setItem('books', JSON.stringify(books));
        editBookForm.style.display = 'none';
        renderBooks();
    });

    // Add Class Book
    addClassBookBtn.addEventListener('click', () => {
        addClassBookForm.style.display = 'block';
    });

    classBookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const book = {
            bookNumber: document.getElementById('bookNumber').value,
            subject: document.getElementById('classSubject').value,
            description: document.getElementById('bookDescription').value,
            totalBooks: document.getElementById('totalBooks').value
        };
        classBooks.push(book);
        localStorage.setItem('classBooks', JSON.stringify(classBooks));
        classBookForm.reset();
        addClassBookForm.style.display = 'none';
        renderClassBooks();
    });

    // Edit Class Book
    window.editClassBook = (index) => {
        const book = classBooks[index];
        document.getElementById('editClassBookIndex').value = index;
        document.getElementById('editBookNumber').value = book.bookNumber;
        document.getElementById('editClassSubject').value = book.subject;
        document.getElementById('editBookDescription').value = book.description;
        document.getElementById('editTotalBooks').value = book.totalBooks;
        editClassBookForm.style.display = 'block';
    };

    editClassBookFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = document.getElementById('editClassBookIndex').value;
        classBooks[index] = {
            bookNumber: document.getElementById('editBookNumber').value,
            subject: document.getElementById('editClassSubject').value,
            description: document.getElementById('editBookDescription').value,
            totalBooks: document.getElementById('editTotalBooks').value
        };
        localStorage.setItem('classBooks', JSON.stringify(classBooks));
        editClassBookForm.style.display = 'none';
        renderClassBooks();
    });

    // Delete Functions
    window.deleteLearner = (index) => {
        if (confirm('Are you sure you want to delete this learner?')) {
            learners.splice(index, 1);
            localStorage.setItem('learners', JSON.stringify(learners));
            renderLearners();
        }
    };
    window.deleteFee = (index) => {
        if (confirm('Are you sure you want to delete this fee record?')) {
            fees.splice(index, 1);
            localStorage.setItem('fees', JSON.stringify(fees));
            renderFees();
        }
    };
    window.deleteBook = (index) => {
        if (confirm('Are you sure you want to delete this book record?')) {
            books.splice(index, 1);
            localStorage.setItem('books', JSON.stringify(books));
            renderBooks();
        }
    };
    window.deleteClassBook = (index) => {
        if (confirm('Are you sure you want to delete this class book record?')) {
            classBooks.splice(index, 1);
            localStorage.setItem('classBooks', JSON.stringify(classBooks));
            renderClassBooks();
        }
    };

    // Pagination
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderLearners();
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (end < learners.length) {
            currentPage++;
            renderLearners();
        }
    });

    // Navigation
    document.querySelectorAll('.sidebar a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('section').forEach(s => s.style.display = 'none');
            document.getElementById(a.getAttribute('href').substring(1)).style.display = 'block';
        });
    });

    // Close Modals
    document.querySelectorAll('.close').forEach(close => {
        close.addEventListener('click', () => {
            addLearnerForm.style.display = 'none';
            addFeeForm.style.display = 'none';
            addBookForm.style.display = 'none';
            addClassBookForm.style.display = 'none';
            editLearnerForm.style.display = 'none';
            editFeeForm.style.display = 'none';
            editBookForm.style.display = 'none';
            editClassBookForm.style.display = 'none';
        });
    });

    document.querySelectorAll('.cancel').forEach(cancel => {
        cancel.addEventListener('click', () => {
            addLearnerForm.style.display = 'none';
            addFeeForm.style.display = 'none';
            addBookForm.style.display = 'none';
            addClassBookForm.style.display = 'none';
            editLearnerForm.style.display = 'none';
            editFeeForm.style.display = 'none';
            editBookForm.style.display = 'none';
            editClassBookForm.style.display = 'none';
        });
    });

    // Download Functions
    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 10;

        doc.text('School Management Report', 10, y);
        y += 10;
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, y);
        y += 10;

        // Learners
        doc.text('Learners', 10, y);
        y += 10;
        learners.forEach(learner => {
            doc.text(`${learner.admissionNo}, ${learner.fullName}, ${learner.gender}, ${learner.dob}`, 10, y);
            y += 10;
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
        });
        y += 10;

        // Fees
        doc.text('Fees', 10, y);
        y += 10;
        fees.forEach(fee => {
            doc.text(`${fee.admissionNo}, ${learners.find(l => l.admissionNo === fee.admissionNo)?.fullName || 'N/A'}, ${fee.term}, ${fee.amountPaid}, ${fee.balance}`, 10, y);
            y += 10;
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
        });
        y += 10;

        // Books (Admin)
        doc.text('Books (Admin)', 10, y);
        y += 10;
        books.forEach(book => {
            doc.text(`${book.admissionNo}, ${learners.find(l => l.admissionNo === book.admissionNo)?.fullName || 'N/A'}, ${book.subject}, ${book.bookTitle}`, 10, y);
            y += 10;
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
        });
        y += 10;

        // Class Books
        doc.text('Class Books', 10, y);
        y += 10;
        classBooks.forEach(book => {
            doc.text(`${book.bookNumber}, ${book.subject}, ${book.description}, ${book.totalBooks}`, 10, y);
            y += 10;
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
        });

        doc.save('school_management_report.pdf');
    }

    function downloadExcel() {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['Learners'],
            ['Admission No.', 'Full Name', 'Gender', 'DoB'],
            ...learners.map(l => [l.admissionNo, l.fullName, l.gender, l.dob]),
            [],
            ['Fees'],
            ['Admission No.', 'Full Name', 'Term', 'Amount Paid', 'Balance'],
            ...fees.map(f => [f.admissionNo, learners.find(l => l.admissionNo === f.admissionNo)?.fullName || 'N/A', f.term, f.amountPaid, f.balance]),
            [],
            ['Books (Admin)'],
            ['Admission No.', 'Full Name', 'Subject', 'Book Title'],
            ...books.map(b => [b.admissionNo, learners.find(l => l.admissionNo === b.admissionNo)?.fullName || 'N/A', b.subject, b.bookTitle]),
            [],
            ['Class Books'],
            ['Book Number', 'Subject', 'Book Description', 'Total Number of Books'],
            ...classBooks.map(b => [b.bookNumber, b.subject, b.description, b.totalBooks])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, 'school_management_report.xlsx');
    }

    // Initial Render (only if logged in)
    if (localStorage.getItem('isLoggedIn') === 'true') {
        renderLearners();
        renderFees();
        renderBooks();
        renderClassBooks();
    }
});