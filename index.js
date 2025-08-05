// Advanced Book Store Application
class BookStore {
    constructor() {
        this.apiUrl = 'https://bookstore-api-six.vercel.app/api/books';
        this.books = [];
        this.filteredBooks = [];
        this.readingList = JSON.parse(localStorage.getItem('readingList')) || [];
        this.currentPage = 1;
        this.booksPerPage = 12;
        this.currentView = localStorage.getItem('viewMode') || 'grid';
        this.searchQuery = '';
        this.selectedGenre = '';
        this.sortBy = 'title';
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.realBooksData = this.createRealBooksDatabase();
        this.currentCarouselIndex = 0;
        this.carouselInterval = null;
        this.isAutoplayActive = true;
        this.typewriterTexts = [
            "Discover, collect, and manage your digital library",
            "Explore thousands of books from every genre",
            "Build your personal reading collection",
            "Find your next favorite book today",
            "Connect with stories that inspire you"
        ];
        this.currentTypewriterIndex = 0;
        
        // Mobile clock tracking
        this.previousMobileHours = '';
        this.previousMobileMinutes = '';
        this.previousMobileSeconds = '';
        this.previousMobileDate = '';
        
        this.init();
    }

    // Initialize the application
    async init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.updateReadingListUI();
        this.startTypewriterEffect();
        this.startRomanClock();
        await this.loadBooks();
        this.setupViewMode();
        this.initializeCarousel();
        
        // Setup responsive carousel
        window.addEventListener('resize', () => this.handleCarouselResize());
    }

    // Setup all event listeners
    setupEventListeners() {
        // Navigation events
        document.getElementById('add-book-btn').addEventListener('click', () => this.openAddBookModal());
        document.getElementById('reading-list-btn').addEventListener('click', () => this.openReadingListModal());
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('refresh-external-btn').addEventListener('click', () => this.refreshExternalBooks());

        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => this.closeAddBookModal());
        document.getElementById('cancel-add').addEventListener('click', () => this.closeAddBookModal());
        document.getElementById('close-reading-list').addEventListener('click', () => this.closeReadingListModal());
        document.getElementById('add-book-form').addEventListener('submit', (e) => this.handleAddBook(e));

        // Search and filter events
        document.getElementById('search-input').addEventListener('input', (e) => this.debounce(() => this.handleSearch(e.target.value), 300)());
        document.getElementById('genre-filter').addEventListener('change', (e) => this.handleGenreFilter(e.target.value));
        document.getElementById('sort-select').addEventListener('change', (e) => this.handleSort(e.target.value));

        // View toggle events
        document.getElementById('grid-view-btn').addEventListener('click', () => this.setViewMode('grid'));
        document.getElementById('list-view-btn').addEventListener('click', () => this.setViewMode('list'));

        // Mobile menu events
        document.getElementById('mobile-menu-btn').addEventListener('click', () => this.toggleMobileMenu());
        document.getElementById('mobile-reading-list-btn').addEventListener('click', () => this.openReadingListModal());
        document.getElementById('mobile-theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('mobile-refresh-external-btn').addEventListener('click', () => this.refreshExternalBooks());
        document.getElementById('mobile-add-book-btn').addEventListener('click', () => this.openAddBookModal());

        // Enhanced Carousel events
        document.getElementById('carousel-autoplay-toggle').addEventListener('click', () => this.toggleAutoplay());

        // Contact form events
        document.getElementById('contact-form').addEventListener('submit', (e) => this.handleContactForm(e));
        
        // Real-time validation for contact form
        document.getElementById('contact-name').addEventListener('blur', () => this.validateContactField('name'));
        document.getElementById('contact-email').addEventListener('blur', () => this.validateContactField('email'));
        document.getElementById('contact-subject').addEventListener('blur', () => this.validateContactField('subject'));
        document.getElementById('contact-message').addEventListener('blur', () => this.validateContactField('message'));

        // Pagination events
        document.getElementById('prev-page').addEventListener('click', () => this.previousPage());
        document.getElementById('next-page').addEventListener('click', () => this.nextPage());

        // Close modals when clicking outside
        document.getElementById('add-book-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-book-modal') this.closeAddBookModal();
        });
        document.getElementById('book-details-modal').addEventListener('click', (e) => {
            if (e.target.id === 'book-details-modal') this.closeBookDetailsModal();
        });
        document.getElementById('reading-list-modal').addEventListener('click', (e) => {
            if (e.target.id === 'reading-list-modal') this.closeReadingListModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    document.getElementById('search-input').focus();
                    break;
                case 'n':
                    e.preventDefault();
                    this.openAddBookModal();
                    break;
                case 'h':
                    e.preventDefault();
                    this.openReadingListModal();
                    break;
            }
        }
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    // Debounce function for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Create realistic book database
    createRealBooksDatabase() {
        return [
            {
                id: 1,
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                isbn: "978-0-06-112008-4",
                publishedDate: "1960-07-11",
                publisher: "J.B. Lippincott & Co.",
                genre: "Classic Literature",
                description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. As young Scout Finch bears witness to the social inequalities of her community, she learns about courage, compassion, and the struggle between good and evil.",
                pageCount: 376,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 2,
                title: "1984",
                author: "George Orwell",
                isbn: "978-0-452-28423-4",
                publishedDate: "1949-06-08",
                publisher: "Secker & Warburg",
                genre: "Dystopian Fiction",
                description: "A dystopian social science fiction novel that follows the life of Winston Smith, a low-ranking member of 'the Party', who is frustrated by the omnipresent eyes of the party, and its ominous ruler Big Brother. Set in Airstrip One, formerly Great Britain, a province of the superstate Oceania.",
                pageCount: 328,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532714506i/40961427.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 3,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                isbn: "978-0-7432-7356-5",
                publishedDate: "1925-04-10",
                publisher: "Charles Scribner's Sons",
                genre: "Classic Literature",
                description: "Set in the summer of 1922, the novel follows the life of narrator Nick Carraway and his neighbor Jay Gatsby, whose obsessive pursuit of his former lover Daisy Buchanan leads to tragedy. A critique of the American Dream during the Jazz Age.",
                pageCount: 180,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 4,
                title: "The Catcher in the Rye",
                author: "J.D. Salinger",
                isbn: "978-0-316-76948-0",
                publishedDate: "1951-07-16",
                publisher: "Little, Brown and Company",
                genre: "Coming-of-Age Fiction",
                description: "The story of Holden Caulfield, a teenager who has been expelled from prep school and spends a few days wandering New York City. A landmark coming-of-age story that captures the alienation and confusion of adolescence.",
                pageCount: 277,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 5,
                title: "Harry Potter and the Philosopher's Stone",
                author: "J.K. Rowling",
                isbn: "978-0-7475-3269-9",
                publishedDate: "1997-06-26",
                publisher: "Bloomsbury",
                genre: "Fantasy",
                description: "The first novel in the Harry Potter series, following the adventures of young wizard Harry Potter as he discovers his magical heritage and attends Hogwarts School of Witchcraft and Wizardry.",
                pageCount: 223,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474154022i/3.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 6,
                title: "The Lord of the Rings: The Fellowship of the Ring",
                author: "J.R.R. Tolkien",
                isbn: "978-0-618-00222-1",
                publishedDate: "1954-07-29",
                publisher: "Allen & Unwin",
                genre: "Fantasy",
                description: "The first volume of the epic fantasy trilogy follows Frodo Baggins as he embarks on a quest to destroy the One Ring and save Middle-earth from the Dark Lord Sauron.",
                pageCount: 423,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654215925i/61215351.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 7,
                title: "Pride and Prejudice",
                author: "Jane Austen",
                isbn: "978-0-14-143951-8",
                publishedDate: "1813-01-28",
                publisher: "T. Egerton",
                genre: "Romance",
                description: "A romantic novel following the emotional development of Elizabeth Bennet, who learns the importance of marrying for love rather than money or social pressure, through her relationship with the proud Mr. Darcy.",
                pageCount: 432,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 8,
                title: "The Hobbit",
                author: "J.R.R. Tolkien",
                isbn: "978-0-547-92822-7",
                publishedDate: "1937-09-21",
                publisher: "George Allen & Unwin",
                genre: "Fantasy",
                description: "The prelude to The Lord of the Rings, following Bilbo Baggins as he joins a group of dwarves on a quest to reclaim their homeland from the dragon Smaug.",
                pageCount: 366,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 9,
                title: "Dune",
                author: "Frank Herbert",
                isbn: "978-0-441-17271-9",
                publishedDate: "1965-08-01",
                publisher: "Chilton Books",
                genre: "Science Fiction",
                description: "Set in the distant future amidst a feudal interstellar society, the novel tells the story of young Paul Atreides and his family as they become embroiled in a war over the desert planet Arrakis and its precious resource, the spice melange.",
                pageCount: 688,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 10,
                title: "The Hunger Games",
                author: "Suzanne Collins",
                isbn: "978-0-439-02348-1",
                publishedDate: "2008-09-14",
                publisher: "Scholastic Press",
                genre: "Young Adult Dystopian",
                description: "In a dystopian future, teenager Katniss Everdeen volunteers to take her sister's place in the Hunger Games, a televised death match. A powerful story of survival, sacrifice, and rebellion.",
                pageCount: 374,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1586722975i/2767052.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 11,
                title: "The Girl with the Dragon Tattoo",
                author: "Stieg Larsson",
                isbn: "978-0-307-45454-1",
                publishedDate: "2005-08-01",
                publisher: "Norstedts Förlag",
                genre: "Mystery Thriller",
                description: "A gripping mystery thriller about journalist Mikael Blomkvist and hacker Lisbeth Salander as they investigate a wealthy family's dark secrets. The first book in the Millennium series.",
                pageCount: 590,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327868566i/2429135.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 12,
                title: "The Alchemist",
                author: "Paulo Coelho",
                isbn: "978-0-06-112241-5",
                publishedDate: "1988-01-01",
                publisher: "HarperCollins",
                genre: "Philosophical Fiction",
                description: "A mystical story about Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. A fable about following your dreams and the journey of self-discovery.",
                pageCount: 163,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 13,
                title: "Brave New World",
                author: "Aldous Huxley",
                isbn: "978-0-06-085052-4",
                publishedDate: "1932-01-01",
                publisher: "Chatto & Windus",
                genre: "Dystopian Fiction",
                description: "A dystopian novel set in a futuristic World State where citizens are genetically bred and pharmaceutically anesthetized to passively serve a ruling order. A prophetic vision of technology's impact on society.",
                pageCount: 288,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1575509280i/5129.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 14,
                title: "The Da Vinci Code",
                author: "Dan Brown",
                isbn: "978-0-307-47492-1",
                publishedDate: "2003-03-18",
                publisher: "Doubleday",
                genre: "Mystery Thriller",
                description: "A mystery thriller following symbologist Robert Langdon as he investigates a murder in the Louvre Museum and discovers a battle between the Priory of Sion and Opus Dei over the possibility of Jesus having been married to Mary Magdalene.",
                pageCount: 689,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579621267i/968.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 15,
                title: "Gone Girl",
                author: "Gillian Flynn",
                isbn: "978-0-307-58836-4",
                publishedDate: "2012-06-05",
                publisher: "Crown Publishing Group",
                genre: "Psychological Thriller",
                description: "A psychological thriller about Nick Dunne and his wife Amy, whose marriage disintegrates when Amy disappears on their fifth wedding anniversary. A dark exploration of modern marriage and media manipulation.",
                pageCount: 419,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554086139i/19288043.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 16,
                title: "The Kite Runner",
                author: "Khaled Hosseini",
                isbn: "978-1-59448-000-3",
                publishedDate: "2003-05-29",
                publisher: "Riverhead Books",
                genre: "Historical Fiction",
                description: "The story of Amir, a young boy from the Wazir Akbar Khan district of Kabul, whose life is shaped by guilt from betraying his servant's son Hassan. A powerful story of friendship, redemption, and the devastation of Afghanistan.",
                pageCount: 371,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579036753i/77203.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 17,
                title: "The Girl on the Train",
                author: "Paula Hawkins",
                isbn: "978-0-85752-431-4",
                publishedDate: "2015-01-13",
                publisher: "Transworld Publishers",
                genre: "Psychological Thriller",
                description: "A psychological thriller told from the perspectives of three women, centering on Rachel, an alcoholic who becomes entangled in a missing person investigation that reveals dark secrets about the people around her.",
                pageCount: 395,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1574364492i/22557272.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 18,
                title: "The Fault in Our Stars",
                author: "John Green",
                isbn: "978-0-525-47881-2",
                publishedDate: "2012-01-10",
                publisher: "Dutton Books",
                genre: "Young Adult Romance",
                description: "A touching love story between two teenagers, Hazel and Gus, who meet at a cancer support group. A beautiful exploration of life, death, and what it means to live fully despite terminal illness.",
                pageCount: 313,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1360206420i/11870085.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 19,
                title: "Where the Crawdads Sing",
                author: "Delia Owens",
                isbn: "978-0-7352-1909-0",
                publishedDate: "2018-08-14",
                publisher: "G.P. Putnam's Sons",
                genre: "Mystery Drama",
                description: "A coming-of-age mystery following Kya Clark, known as the 'Marsh Girl,' who grows up isolated in the dangerous marshlands of North Carolina. When a popular local man is found dead, Kya becomes the prime suspect.",
                pageCount: 384,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582135294i/36809135.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 20,
                title: "The Silent Patient",
                author: "Alex Michaelides",
                isbn: "978-1-250-30170-7",
                publishedDate: "2019-02-05",
                publisher: "Celadon Books",
                genre: "Psychological Thriller",
                description: "A psychological thriller about Alicia Berenson, a woman who refuses to speak after allegedly murdering her husband, and the psychotherapist determined to treat her and uncover the truth behind her silence.",
                pageCount: 325,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582143487i/40097951.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 21,
                title: "Educated",
                author: "Tara Westover",
                isbn: "978-0-399-59050-4",
                publishedDate: "2018-02-20",
                publisher: "Random House",
                genre: "Memoir",
                description: "A powerful memoir about a woman who grows up in a survivalist family in rural Idaho and eventually earns a PhD from Cambridge University. A story of self-invention and the struggle between loyalty to family and the quest for knowledge.",
                pageCount: 334,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 22,
                title: "Becoming",
                author: "Michelle Obama",
                isbn: "978-1-5247-6313-8",
                publishedDate: "2018-11-13",
                publisher: "Crown Publishing Group",
                genre: "Autobiography",
                description: "The memoir of former First Lady Michelle Obama, chronicling her life from her childhood in Chicago to her years in the White House. An intimate and inspiring account of personal growth and public service.",
                pageCount: 448,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1528206996i/38746485.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 23,
                title: "Sapiens: A Brief History of Humankind",
                author: "Yuval Noah Harari",
                isbn: "978-0-06-231609-7",
                publishedDate: "2014-02-10",
                publisher: "Harper",
                genre: "Non-Fiction History",
                description: "A thought-provoking exploration of human history from the Stone Age to the present, examining how Homo sapiens came to dominate the world through cognitive, agricultural, and scientific revolutions.",
                pageCount: 443,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1420585954i/23692271.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 24,
                title: "Atomic Habits",
                author: "James Clear",
                isbn: "978-0-7352-1129-2",
                publishedDate: "2018-10-16",
                publisher: "Avery",
                genre: "Self-Help",
                description: "A practical guide to building good habits and breaking bad ones, based on scientific research and real-world applications. Clear provides a framework for improving every day by focusing on small, incremental changes.",
                pageCount: 320,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535115320i/40121378.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 25,
                title: "The Seven Husbands of Evelyn Hugo",
                author: "Taylor Jenkins Reid",
                isbn: "978-1-5011-3981-0",
                publishedDate: "2017-06-13",
                publisher: "Atria Books",
                genre: "Historical Fiction",
                description: "A captivating novel about reclusive Hollywood icon Evelyn Hugo who finally decides to tell her life story to unknown journalist Monique Grant. A tale of ambition, love, and the price of fame.",
                pageCount: 400,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1618414013i/32620332.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 26,
                title: "It Ends with Us",
                author: "Colleen Hoover",
                isbn: "978-1-5011-1078-9",
                publishedDate: "2016-08-02",
                publisher: "Atria Books",
                genre: "Contemporary Romance",
                description: "A powerful story about Lily Bloom who overcomes a traumatic childhood to start a new life in Boston and pursue her dream of opening her own business. A moving tale of resilience, love, and breaking cycles of abuse.",
                pageCount: 384,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1470427482i/18133839.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 27,
                title: "The Midnight Library",
                author: "Matt Haig",
                isbn: "978-0-525-55948-1",
                publishedDate: "2020-08-13",
                publisher: "Viking",
                genre: "Philosophical Fiction",
                description: "A philosophical novel about Nora Seed, who finds herself in a magical library between life and death where she can experience infinite versions of her life. A thoughtful exploration of regret, possibility, and what makes life worth living.",
                pageCount: 288,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 28,
                title: "Project Hail Mary",
                author: "Andy Weir",
                isbn: "978-0-593-13520-6",
                publishedDate: "2021-05-04",
                publisher: "Ballantine Books",
                genre: "Science Fiction",
                description: "A science fiction novel about Ryland Grace, who wakes up on a spaceship with no memory of how he got there, only to discover he's humanity's last hope for survival. A thrilling story of scientific problem-solving and unlikely friendship.",
                pageCount: 496,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 29,
                title: "The Thursday Murder Club",
                author: "Richard Osman",
                isbn: "978-1-984-80043-1",
                publishedDate: "2020-09-03",
                publisher: "Pamela Dorman Books",
                genre: "Cozy Mystery",
                description: "A charming mystery about four unlikely friends in a retirement village who meet weekly to investigate cold cases. When a real murder occurs in their community, they find themselves at the center of their first live case.",
                pageCount: 368,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1590777963i/46000520.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            },
            {
                id: 30,
                title: "Circe",
                author: "Madeline Miller",
                isbn: "978-0-316-55633-4",
                publishedDate: "2018-04-10",
                publisher: "Little, Brown and Company",
                genre: "Mythology Fiction",
                description: "A beautiful retelling of Greek mythology from the perspective of Circe, the witch-goddess who transforms Odysseus's men into pigs. A powerful story of transformation, love, and finding one's own strength.",
                pageCount: 393,
                language: "English",
                coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1565909496i/35959740.jpg",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z"
            }
        ];
    }
    async loadBooks() {
        this.showLoading(true);
        
        try {
            // Load from local JSON files
            const [booksResponse, books2Response, books3Response] = await Promise.all([
                fetch('./books.json'),
                fetch('./book2.json'),
                fetch('./book3.json')
            ]);
            
            const books1 = await booksResponse.json();
            const books2 = await books2Response.json();
            const books3 = await books3Response.json();
            
            // Combine all local books
            this.books = [...books1, ...books2, ...books3];
            
            this.filteredBooks = [...this.books];
            this.populateGenreFilter();
            this.updateStats();
            this.renderBooks();
            this.updatePagination();
            
            this.showToast(`Loaded ${this.books.length} books successfully!`, 'success');
            
            // Optionally fetch external books in background
            setTimeout(() => {
                this.fetchExternalBooks();
            }, 2000);
            
        } catch (error) {
            console.error('Error loading books:', error);
            this.showToast('Failed to load books. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Show/hide loading state
    showLoading(show) {
        const loading = document.getElementById('loading');
        const container = document.getElementById('books-container');
        
        if (show) {
            loading.classList.remove('hidden');
            container.classList.add('hidden');
        } else {
            loading.classList.add('hidden');
            container.classList.remove('hidden');
        }
    }

    // Populate genre filter dropdown
    populateGenreFilter() {
        const genreFilter = document.getElementById('genre-filter');
        const genres = [...new Set(this.books.map(book => book.genre).filter(Boolean))].sort();
        
        // Clear existing options except "All Genres"
        genreFilter.innerHTML = '<option value="">All Genres</option>';
        
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    }

    // Update statistics
    updateStats() {
        const totalBooks = this.books.length;
        const totalAuthors = new Set(this.books.map(book => book.author)).size;
        const totalGenres = new Set(this.books.map(book => book.genre).filter(Boolean)).size;
        
        this.animateCounter('total-books', totalBooks);
        this.animateCounter('total-authors', totalAuthors);
        this.animateCounter('total-genres', totalGenres);
        
        // Animate progress bars
        setTimeout(() => {
            this.animateProgressBar('books-progress', Math.min(totalBooks / 50 * 100, 100));
            this.animateProgressBar('authors-progress', Math.min(totalAuthors / 25 * 100, 100));
            this.animateProgressBar('genres-progress', Math.min(totalGenres / 15 * 100, 100));
        }, 500);
    }

    // Animate progress bars
    animateProgressBar(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.width = `${percentage}%`;
        }
    }

    // Animate counter numbers
    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const startValue = 0;
        const duration = 1000;
        const startTime = Date.now();
        
        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        updateCounter();
    }

    // Handle search
    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.currentPage = 1;
        this.filterBooks();
    }

    // Handle genre filter
    handleGenreFilter(genre) {
        this.selectedGenre = genre;
        this.currentPage = 1;
        this.filterBooks();
    }

    // Handle sorting
    handleSort(sortBy) {
        this.sortBy = sortBy;
        this.filterBooks();
    }

    // Filter and sort books
    filterBooks() {
        let filtered = [...this.books];
        
        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(book => 
                book.title.toLowerCase().includes(this.searchQuery) ||
                book.author.toLowerCase().includes(this.searchQuery) ||
                book.genre?.toLowerCase().includes(this.searchQuery) ||
                book.description?.toLowerCase().includes(this.searchQuery)
            );
        }
        
        // Apply genre filter
        if (this.selectedGenre) {
            filtered = filtered.filter(book => book.genre === this.selectedGenre);
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[this.sortBy];
            let bValue = b[this.sortBy];
            
            // Handle different data types
            if (this.sortBy === 'publishedDate') {
                aValue = new Date(aValue || '1900-01-01');
                bValue = new Date(bValue || '1900-01-01');
            } else if (this.sortBy === 'pageCount') {
                aValue = parseInt(aValue) || 0;
                bValue = parseInt(bValue) || 0;
            } else {
                aValue = (aValue || '').toString().toLowerCase();
                bValue = (bValue || '').toString().toLowerCase();
            }
            
            return aValue > bValue ? 1 : -1;
        });
        
        this.filteredBooks = filtered;
        this.renderBooks();
        this.updatePagination();
        this.updateActiveFilters();
    }

    // Update active filters display
    updateActiveFilters() {
        const container = document.getElementById('active-filters');
        const hasFilters = this.searchQuery || this.selectedGenre;
        
        if (hasFilters) {
            container.classList.remove('hidden');
            let filtersHtml = '<span class="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>';
            
            if (this.searchQuery) {
                filtersHtml += `
                    <span class="filter-tag inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Search: "${this.searchQuery}"
                        <button onclick="bookStore.clearSearchFilter()" class="ml-2 text-blue-600 hover:text-blue-800">×</button>
                    </span>
                `;
            }
            
            if (this.selectedGenre) {
                filtersHtml += `
                    <span class="filter-tag inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Genre: ${this.selectedGenre}
                        <button onclick="bookStore.clearGenreFilter()" class="ml-2 text-green-600 hover:text-green-800">×</button>
                    </span>
                `;
            }
            
            container.innerHTML = filtersHtml;
        } else {
            container.classList.add('hidden');
        }
    }

    // Clear search filter
    clearSearchFilter() {
        document.getElementById('search-input').value = '';
        this.searchQuery = '';
        this.filterBooks();
    }

    // Clear genre filter
    clearGenreFilter() {
        document.getElementById('genre-filter').value = '';
        this.selectedGenre = '';
        this.filterBooks();
    }

    // Render books
    renderBooks() {
        const container = document.getElementById('books-container');
        const noResults = document.getElementById('no-results');
        
        if (this.filteredBooks.length === 0) {
            container.classList.add('hidden');
            noResults.classList.remove('hidden');
            return;
        }
        
        container.classList.remove('hidden');
        noResults.classList.add('hidden');
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.booksPerPage;
        const endIndex = startIndex + this.booksPerPage;
        const booksToShow = this.filteredBooks.slice(startIndex, endIndex);
        
        // Set container classes based on view mode
        container.className = this.currentView === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 staggered-animation'
            : 'space-y-4 staggered-animation';
        
        container.innerHTML = booksToShow.map(book => this.createBookCard(book)).join('');
        
        // Trigger staggered animation
        setTimeout(() => {
            container.classList.remove('staggered-animation');
        }, 100);
    }

    // Create book card HTML
    createBookCard(book) {
        const isInReadingList = this.readingList.some(item => item.id === book.id);
        const bookCover = book.coverImage || this.generateBookCover(book.title);
        
        if (this.currentView === 'list') {
            return `
                <div class="book-card list-view bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 interactive-hover">
                    <div class="flex gap-6">
                        <div class="book-cover w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                            ${book.coverImage ? 
                                `<img src="${book.coverImage}" alt="${book.title}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='${this.generateBookCover(book.title)}'">`
                                : this.generateBookCover(book.title)
                            }
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white truncate">${book.title}</h3>
                                <div class="flex items-center space-x-2 ml-4">
                                    <button onclick="bookStore.toggleReadingList(${book.id})" class="heart-btn ${isInReadingList ? 'active' : ''} p-2 text-gray-400 hover:text-red-500 transition-colors">
                                        <i class="fas fa-heart"></i>
                                    </button>
                                    <button onclick="bookStore.openBookDetails(${book.id})" class="p-2 text-primary hover:text-primary/80 transition-colors">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button onclick="bookStore.deleteBook(${book.id})" class="p-2 text-red-500 hover:text-red-700 transition-colors">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="text-gray-600 dark:text-gray-400 mb-2">by ${book.author}</p>
                            ${book.genre ? `<span class="genre-badge inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary dark:bg-primary/20">${book.genre}</span>` : ''}
                            <p class="text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">${book.description || 'No description available.'}</p>
                            <div class="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                                <span><i class="fas fa-calendar mr-1"></i>${book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'Unknown'}</span>
                                <span><i class="fas fa-file-alt mr-1"></i>${book.pageCount || 'Unknown'} pages</span>
                                <span><i class="fas fa-language mr-1"></i>${book.language || 'English'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="book-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden interactive-hover">
                    <div class="book-cover h-64 relative shadow-inner">
                        ${book.coverImage ? 
                            `<img src="${book.coverImage}" alt="${book.title}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='${this.generateBookCover(book.title)}'">`
                            : this.generateBookCover(book.title)
                        }
                        <div class="absolute top-2 right-2">
                            <button onclick="bookStore.toggleReadingList(${book.id})" class="heart-btn ${isInReadingList ? 'active' : ''} bg-white/90 backdrop-blur-sm rounded-full p-2 text-gray-600 hover:text-red-500 transition-all shadow-md">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <div class="text-white text-xs opacity-90">
                                <i class="fas fa-calendar mr-1"></i>${book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'Unknown'}
                            </div>
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">${book.title}</h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-3 font-medium">by ${book.author}</p>
                        ${book.genre ? `<span class="genre-badge inline-block px-3 py-1 text-xs rounded-full mb-3 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary dark:from-primary/20 dark:to-secondary/20 border border-primary/20">${book.genre}</span>` : ''}
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">${book.description || 'No description available.'}</p>
                        <div class="flex items-center justify-between">
                            <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <div><i class="fas fa-book mr-1 text-primary"></i>${book.pageCount || 'Unknown'} pages</div>
                                <div><i class="fas fa-globe mr-1 text-secondary"></i>${book.language || 'English'}</div>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="bookStore.openBookDetails(${book.id})" class="btn-primary px-3 py-2 text-xs rounded-lg text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all">
                                    <i class="fas fa-eye mr-1"></i>Details
                                </button>
                                <button onclick="bookStore.deleteBook(${book.id})" class="btn-danger px-3 py-2 text-xs rounded-lg text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all">
                                    <i class="fas fa-trash mr-1"></i>Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Generate book cover placeholder
    generateBookCover(title) {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        ];
        
        const colorIndex = title.length % colors.length;
        const initials = title.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        
        return `
            <div class="book-cover-placeholder w-full h-full" style="background: ${colors[colorIndex]}">
                <span class="text-white font-bold text-2xl">${initials}</span>
            </div>
        `;
    }

    // Set view mode
    setViewMode(mode) {
        this.currentView = mode;
        localStorage.setItem('viewMode', mode);
        
        // Update button states
        document.getElementById('grid-view-btn').classList.toggle('active', mode === 'grid');
        document.getElementById('list-view-btn').classList.toggle('active', mode === 'list');
        
        this.renderBooks();
    }

    // Setup view mode
    setupViewMode() {
        this.setViewMode(this.currentView);
    }

    // Pagination methods
    updatePagination() {
        const totalPages = Math.ceil(this.filteredBooks.length / this.booksPerPage);
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageNumbers = document.getElementById('page-numbers');
        
        if (totalPages <= 1) {
            pagination.classList.add('hidden');
            return;
        }
        
        pagination.classList.remove('hidden');
        
        // Update button states
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
        
        // Generate page numbers
        pageNumbers.innerHTML = '';
        const maxVisiblePages = 5;
        const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => this.goToPage(i);
            pageNumbers.appendChild(pageBtn);
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderBooks();
        this.updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredBooks.length / this.booksPerPage);
        if (this.currentPage < totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }

    // Modal management
    openAddBookModal() {
        document.getElementById('add-book-modal').classList.remove('hidden');
        document.getElementById('add-book-modal').classList.add('flex');
        document.getElementById('book-title').focus();
    }

    closeAddBookModal() {
        document.getElementById('add-book-modal').classList.add('hidden');
        document.getElementById('add-book-modal').classList.remove('flex');
        document.getElementById('add-book-form').reset();
    }

    openBookDetails(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;
        
        const modal = document.getElementById('book-details-modal');
        const content = document.getElementById('book-details-content');
        const isInReadingList = this.readingList.some(item => item.id === book.id);
        
        content.innerHTML = `
            <div class="book-details-header text-white p-6">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h2 class="text-3xl font-bold mb-2">${book.title}</h2>
                        <p class="text-xl opacity-90">by ${book.author}</p>
                        ${book.genre ? `<span class="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">${book.genre}</span>` : ''}
                    </div>
                    <button onclick="bookStore.closeBookDetailsModal()" class="text-white/80 hover:text-white transition-colors">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-1">
                        <div class="book-cover w-full h-80 rounded-lg overflow-hidden mb-4 shadow-xl">
                            ${book.coverImage ? 
                                `<img src="${book.coverImage}" alt="${book.title}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='${this.generateBookCover(book.title)}'">`
                                : this.generateBookCover(book.title)
                            }
                        </div>
                        <div class="space-y-3">
                            <button onclick="bookStore.toggleReadingList(${book.id})" class="w-full btn-primary ${isInReadingList ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'} text-white py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                                <i class="fas fa-heart mr-2"></i>${isInReadingList ? 'Remove from Reading List' : 'Add to Reading List'}
                            </button>
                            <button onclick="bookStore.deleteBook(${book.id})" class="w-full btn-danger bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                                <i class="fas fa-trash mr-2"></i>Delete Book
                            </button>
                        </div>
                    </div>
                    <div class="lg:col-span-2">
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                                <div class="text-sm text-blue-600 dark:text-blue-400 font-medium">Pages</div>
                                <div class="font-bold text-xl text-blue-800 dark:text-blue-300">${book.pageCount || '?'}</div>
                            </div>
                            <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
                                <div class="text-sm text-green-600 dark:text-green-400 font-medium">Published</div>
                                <div class="font-bold text-xl text-green-800 dark:text-green-300">${book.publishedDate ? new Date(book.publishedDate).getFullYear() : '?'}</div>
                            </div>
                            <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                                <div class="text-sm text-purple-600 dark:text-purple-400 font-medium">Language</div>
                                <div class="font-bold text-xl text-purple-800 dark:text-purple-300">${book.language || 'EN'}</div>
                            </div>
                            <div class="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
                                <div class="text-sm text-orange-600 dark:text-orange-400 font-medium">Rating</div>
                                <div class="font-bold text-xl text-orange-800 dark:text-orange-300">
                                    <i class="fas fa-star text-yellow-500"></i>
                                    ${(Math.random() * 2 + 3).toFixed(1)}
                                </div>
                            </div>
                        </div>
                        
                        ${book.publisher ? `
                            <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                    <i class="fas fa-building mr-2 text-primary"></i>Publisher
                                </h4>
                                <p class="text-gray-600 dark:text-gray-400">${book.publisher}</p>
                            </div>
                        ` : ''}
                        
                        ${book.isbn ? `
                            <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                    <i class="fas fa-barcode mr-2 text-secondary"></i>ISBN
                                </h4>
                                <p class="text-gray-600 dark:text-gray-400 font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded border">${book.isbn}</p>
                            </div>
                        ` : ''}
                        
                        <div class="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h4 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                <i class="fas fa-align-left mr-2 text-accent"></i>Description
                            </h4>
                            <div class="prose dark:prose-invert max-w-none">
                                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${book.description || 'No description available for this book.'}</p>
                            </div>
                        </div>
                        
                        <div class="mt-6 flex flex-wrap gap-2">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                <i class="fas fa-tag mr-1"></i>
                                ${book.genre || 'Uncategorized'}
                            </span>
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                                <i class="fas fa-clock mr-1"></i>
                                Est. ${Math.ceil((book.pageCount || 200) / 250)} hours read
                            </span>
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                                <i class="fas fa-calendar-plus mr-1"></i>
                                Added ${new Date(book.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        modal.querySelector('.bg-white').classList.add('modal-enter');
    }

    closeBookDetailsModal() {
        document.getElementById('book-details-modal').classList.add('hidden');
        document.getElementById('book-details-modal').classList.remove('flex');
    }

    openReadingListModal() {
        const modal = document.getElementById('reading-list-modal');
        const content = document.getElementById('reading-list-content');
        
        if (this.readingList.length === 0) {
            content.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-heart text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Your reading list is empty</h3>
                    <p class="text-gray-500 dark:text-gray-500">Add books to your reading list by clicking the heart icon</p>
                </div>
            `;
        } else {
            content.innerHTML = this.readingList.map(book => `
                <div class="reading-list-item bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div class="flex items-center gap-4">
                        <div class="book-cover w-16 h-20 rounded overflow-hidden flex-shrink-0">
                            ${this.generateBookCover(book.title)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-gray-900 dark:text-white truncate">${book.title}</h4>
                            <p class="text-gray-600 dark:text-gray-400">${book.author}</p>
                            ${book.genre ? `<span class="text-xs text-gray-500">${book.genre}</span>` : ''}
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="bookStore.openBookDetails(${book.id})" class="p-2 text-primary hover:text-primary/80 transition-colors">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="bookStore.removeFromReadingList(${book.id})" class="p-2 text-red-500 hover:text-red-700 transition-colors">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    closeReadingListModal() {
        document.getElementById('reading-list-modal').classList.add('hidden');
        document.getElementById('reading-list-modal').classList.remove('flex');
    }

    closeAllModals() {
        this.closeAddBookModal();
        this.closeBookDetailsModal();
        this.closeReadingListModal();
    }

    // Reading list management
    toggleReadingList(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;
        
        const existingIndex = this.readingList.findIndex(item => item.id === bookId);
        
        if (existingIndex > -1) {
            this.readingList.splice(existingIndex, 1);
            this.showToast(`"${book.title}" removed from reading list`, 'info');
        } else {
            this.readingList.push(book);
            this.showToast(`"${book.title}" added to reading list`, 'success');
        }
        
        localStorage.setItem('readingList', JSON.stringify(this.readingList));
        this.updateReadingListUI();
        this.renderBooks(); // Re-render to update heart icons
    }

    removeFromReadingList(bookId) {
        const book = this.readingList.find(b => b.id === bookId);
        if (!book) return;
        
        this.readingList = this.readingList.filter(item => item.id !== bookId);
        localStorage.setItem('readingList', JSON.stringify(this.readingList));
        this.updateReadingListUI();
        this.openReadingListModal(); // Refresh the modal content
        this.renderBooks(); // Re-render to update heart icons
        this.showToast(`"${book.title}" removed from reading list`, 'info');
    }

    updateReadingListUI() {
        const counter = document.getElementById('reading-list-count');
        const count = this.readingList.length;
        
        if (count > 0) {
            counter.textContent = count;
            counter.classList.remove('hidden');
        } else {
            counter.classList.add('hidden');
        }
    }

    // Book management
    async handleAddBook(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const bookData = {
            id: Date.now(), // Generate unique ID
            title: document.getElementById('book-title').value,
            author: document.getElementById('book-author').value,
            isbn: document.getElementById('book-isbn').value,
            genre: document.getElementById('book-genre').value,
            publisher: document.getElementById('book-publisher').value,
            publishedDate: document.getElementById('book-published-date').value,
            pageCount: parseInt(document.getElementById('book-page-count').value) || null,
            language: document.getElementById('book-language').value,
            description: document.getElementById('book-description').value,
            coverImage: null, // Will use generated cover
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Remove empty fields
        Object.keys(bookData).forEach(key => {
            if (!bookData[key] && key !== 'id' && key !== 'coverImage') delete bookData[key];
        });
        
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Add to books array
            this.books.unshift(bookData); // Add to beginning
            this.filteredBooks = [...this.books];
            
            // Update cache
            localStorage.setItem('booksCache', JSON.stringify(this.books));
            localStorage.setItem('booksCacheTimestamp', Date.now().toString());
            
            this.populateGenreFilter();
            this.updateStats();
            this.renderBooks();
            this.updatePagination();
            this.closeAddBookModal();
            
            this.showToast(`"${bookData.title}" added successfully!`, 'success');
            
        } catch (error) {
            console.error('Error adding book:', error);
            this.showToast('Failed to add book. Please try again.', 'error');
        }
    }

    async deleteBook(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;
        
        if (!confirm(`Are you sure you want to delete "${book.title}"?`)) return;
        
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Remove from local arrays
            this.books = this.books.filter(b => b.id !== bookId);
            this.filteredBooks = this.filteredBooks.filter(b => b.id !== bookId);
            this.readingList = this.readingList.filter(b => b.id !== bookId);
            
            // Update storage
            localStorage.setItem('booksCache', JSON.stringify(this.books));
            localStorage.setItem('booksCacheTimestamp', Date.now().toString());
            localStorage.setItem('readingList', JSON.stringify(this.readingList));
            
            this.populateGenreFilter();
            this.updateStats();
            this.updateReadingListUI();
            this.renderBooks();
            this.updatePagination();
            this.closeBookDetailsModal();
            
            this.showToast(`"${book.title}" deleted successfully`, 'success');
            
        } catch (error) {
            console.error('Error deleting book:', error);
            this.showToast('Failed to delete book. Please try again.', 'error');
        }
    }

    // Theme management
    initializeTheme() {
        const html = document.documentElement;
        if (this.isDarkMode) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }

    toggleTheme() {
        const html = document.documentElement;
        this.isDarkMode = !this.isDarkMode;
        
        if (this.isDarkMode) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        
        localStorage.setItem('darkMode', this.isDarkMode.toString());
        this.showToast(`${this.isDarkMode ? 'Dark' : 'Light'} mode enabled`, 'info');
    }

    // Toast notifications
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        toast.className = `toast ${type} text-white px-6 py-4 rounded-lg shadow-lg min-w-80 flex items-center justify-between`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${this.getToastIcon(type)} mr-3"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()" class="ml-4 text-white/80 hover:text-white">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.transform = 'translateX(100%)';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    // External API Integration Methods
    async fetchExternalBooks() {
        try {
            this.showToast('Fetching books from external APIs...', 'info');
            
            // Try multiple sources
            const openLibraryBooks = await this.fetchFromOpenLibrary();
            const googleBooks = await this.fetchFromGoogleBooks();
            
            // Combine and deduplicate
            const allExternalBooks = [...openLibraryBooks, ...googleBooks];
            const uniqueBooks = this.deduplicateBooks(allExternalBooks);
            
            if (uniqueBooks.length > 0) {
                // Add to current books with unique IDs
                const startId = Math.max(...this.books.map(b => b.id), 0) + 1;
                const newBooks = uniqueBooks.map((book, index) => ({
                    ...book,
                    id: startId + index,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));
                
                this.books = [...this.books, ...newBooks];
                this.filteredBooks = [...this.books];
                this.populateGenreFilter();
                this.filterBooks();
                this.updateStats();
                this.initializeCarousel(); // Refresh carousel with new books
                
                this.showToast(`Successfully fetched ${uniqueBooks.length} new books!`, 'success');
            } else {
                this.showToast('No new books found from external APIs', 'warning');
            }
        } catch (error) {
            console.error('Error fetching external books:', error);
            this.showToast('Failed to fetch external books. Please check your internet connection.', 'error');
        }
    }

    async fetchFromOpenLibrary() {
        try {
            const subjects = ['fiction', 'science', 'history', 'biography', 'mystery', 'romance', 'fantasy', 'thriller'];
            const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
            
            // Use a CORS proxy or the direct API with better error handling
            const apiUrl = `https://openlibrary.org/subjects/${randomSubject}.json?limit=15`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'BookVault/1.0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Open Library API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.works || data.works.length === 0) {
                console.log('No works found from Open Library');
                return [];
            }
            
            return data.works.slice(0, 8).map(work => ({
                title: work.title || 'Unknown Title',
                author: work.authors && work.authors.length > 0 ? work.authors[0]?.name || 'Unknown Author' : 'Unknown Author',
                isbn: work.isbn && work.isbn.length > 0 ? work.isbn[0] : `OL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                publishedDate: work.first_publish_year ? `${work.first_publish_year}-01-01` : new Date().toISOString().split('T')[0],
                publisher: 'Open Library Collection',
                genre: this.capitalizeWords(randomSubject),
                description: work.subject && work.subject.length > 0 
                    ? `A ${randomSubject} book covering: ${work.subject.slice(0, 3).join(', ')}. ${this.generateDescription(work.title, randomSubject)}`
                    : this.generateDescription(work.title, randomSubject),
                pageCount: work.edition_count ? Math.min(work.edition_count * 50, 800) : Math.floor(Math.random() * 400) + 150,
                language: 'English',
                coverImage: work.cover_id 
                    ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
                    : this.getRandomUnsplashImage(),
                source: 'OpenLibrary'
            }));
        } catch (error) {
            console.error('OpenLibrary API error:', error);
            console.log('Falling back to generated books for Open Library');
            return this.generateFallbackBooks('OpenLibrary', 3);
        }
    }

    async fetchFromGoogleBooks() {
        try {
            const queries = ['bestsellers', 'new+releases', 'classic+literature', 'science+fiction', 'mystery+thriller', 'romance', 'biography', 'self+help'];
            const randomQuery = queries[Math.floor(Math.random() * queries.length)];
            
            const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${randomQuery}&maxResults=12&orderBy=relevance&langRestrict=en`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Google Books API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                console.log('No items found from Google Books');
                return [];
            }
            
            return data.items.slice(0, 8).map(item => {
                const volumeInfo = item.volumeInfo;
                const saleInfo = item.saleInfo || {};
                
                return {
                    title: volumeInfo.title || 'Unknown Title',
                    author: volumeInfo.authors && volumeInfo.authors.length > 0 ? volumeInfo.authors[0] : 'Unknown Author',
                    isbn: volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers.length > 0 
                        ? volumeInfo.industryIdentifiers[0]?.identifier || `GB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                        : `GB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    publishedDate: volumeInfo.publishedDate || new Date().toISOString().split('T')[0],
                    publisher: volumeInfo.publisher || 'Google Books Collection',
                    genre: volumeInfo.categories && volumeInfo.categories.length > 0 
                        ? volumeInfo.categories[0] 
                        : this.capitalizeWords(randomQuery.replace(/\+/g, ' ')),
                    description: volumeInfo.description 
                        ? this.truncateText(volumeInfo.description.replace(/<[^>]*>/g, ''), 250)
                        : this.generateDescription(volumeInfo.title, volumeInfo.categories?.[0] || 'General'),
                    pageCount: volumeInfo.pageCount || Math.floor(Math.random() * 400) + 150,
                    language: volumeInfo.language || 'English',
                    coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') 
                        || volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:')
                        || this.getRandomUnsplashImage(),
                    source: 'GoogleBooks',
                    rating: volumeInfo.averageRating || null,
                    ratingsCount: volumeInfo.ratingsCount || null
                };
            }).filter(book => book.title !== 'Unknown Title'); // Filter out books with no proper title
        } catch (error) {
            console.error('Google Books API error:', error);
            console.log('Falling back to generated books for Google Books');
            return this.generateFallbackBooks('GoogleBooks', 4);
        }
    }

    deduplicateBooks(books) {
        const seen = new Set();
        const existingTitles = new Set(this.books.map(b => b.title.toLowerCase()));
        
        return books.filter(book => {
            const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
            if (seen.has(key) || existingTitles.has(book.title.toLowerCase())) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    getRandomUnsplashImage() {
        const bookImages = [
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1569701947767-d2da7d1d5fd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        ];
        return bookImages[Math.floor(Math.random() * bookImages.length)];
    }

    capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    // Generate fallback books when APIs fail
    generateFallbackBooks(source, count) {
        const fallbackBooks = [];
        const genres = ['Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Biography', 'History', 'Fantasy'];
        const authorSuffixes = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        const titleWords = ['The', 'A', 'An', 'Secret', 'Hidden', 'Lost', 'Last', 'First', 'Great', 'Amazing', 'Mystery', 'Journey', 'Story', 'Tale'];
        
        for (let i = 0; i < count; i++) {
            const genre = genres[Math.floor(Math.random() * genres.length)];
            const title = `${titleWords[Math.floor(Math.random() * titleWords.length)]} ${titleWords[Math.floor(Math.random() * titleWords.length)]}`;
            const author = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}. ${authorSuffixes[Math.floor(Math.random() * authorSuffixes.length)]}`;
            
            fallbackBooks.push({
                title,
                author,
                isbn: `FB-${source}-${Date.now()}-${i}`,
                publishedDate: `${2000 + Math.floor(Math.random() * 24)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
                publisher: `${source} Collection`,
                genre,
                description: this.generateDescription(title, genre),
                pageCount: Math.floor(Math.random() * 400) + 150,
                language: 'English',
                coverImage: this.getRandomUnsplashImage(),
                source: source
            });
        }
        
        return fallbackBooks;
    }

    // Generate description for books
    generateDescription(title, genre) {
        const descriptions = {
            'Fiction': [`A compelling work of fiction that explores the human condition through engaging storytelling.`, `An immersive narrative that takes readers on an unforgettable journey.`],
            'Science Fiction': [`A thrilling exploration of future possibilities and technological advancement.`, `An imaginative tale that pushes the boundaries of what's possible.`],
            'Mystery': [`A gripping mystery that will keep you guessing until the very end.`, `A suspenseful thriller filled with unexpected twists and turns.`],
            'Romance': [`A heartwarming love story that celebrates the power of human connection.`, `An enchanting romance that will touch your heart.`],
            'Biography': [`An inspiring true story of triumph over adversity.`, `A fascinating look into the life of a remarkable individual.`],
            'History': [`A detailed exploration of significant historical events and their impact.`, `An engaging historical account that brings the past to life.`],
            'Fantasy': [`An epic fantasy adventure filled with magic and wonder.`, `A magical tale that transports readers to another world.`]
        };
        
        const genreDescriptions = descriptions[genre] || descriptions['Fiction'];
        const baseDescription = genreDescriptions[Math.floor(Math.random() * genreDescriptions.length)];
        
        return `${baseDescription} "${title}" offers readers an engaging experience that combines quality storytelling with meaningful themes.`;
    }

    // Capitalize words helper
    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }

    // Truncate text helper
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
    }

    // Refresh external books manually
    async refreshExternalBooks() {
        try {
            // Show loading state
            const refreshBtn = document.getElementById('refresh-external-btn');
            const mobileRefreshBtn = document.getElementById('mobile-refresh-external-btn');
            
            if (refreshBtn) {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
            }
            if (mobileRefreshBtn) {
                mobileRefreshBtn.disabled = true;
                mobileRefreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }
            
            await this.fetchExternalBooks();
            
            // Reset button states
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Fetch External';
            }
            if (mobileRefreshBtn) {
                mobileRefreshBtn.disabled = false;
                mobileRefreshBtn.innerHTML = '<i class="fas fa-sync"></i>';
            }
        } catch (error) {
            console.error('Error refreshing external books:', error);
            this.showToast('Failed to refresh external books', 'error');
            
            // Reset button states on error
            const refreshBtn = document.getElementById('refresh-external-btn');
            const mobileRefreshBtn = document.getElementById('mobile-refresh-external-btn');
            
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Fetch External';
            }
            if (mobileRefreshBtn) {
                mobileRefreshBtn.disabled = false;
                mobileRefreshBtn.innerHTML = '<i class="fas fa-sync"></i>';
            }
        }
    }

    // Handle carousel resize for responsiveness
    handleCarouselResize() {
        // Reinitialize carousel on window resize
        if (this.books.length > 0) {
            setTimeout(() => {
                this.initializeCarousel();
            }, 100);
        }
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Mobile Menu functionality
    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuBtn = document.getElementById('mobile-menu-btn');
        const icon = menuBtn.querySelector('i');
        
        mobileMenu.classList.toggle('hidden');
        
        if (mobileMenu.classList.contains('hidden')) {
            icon.className = 'fas fa-bars text-xl';
        } else {
            icon.className = 'fas fa-times text-xl';
        }
    }

    // Handle carousel resize for responsiveness
    handleCarouselResize() {
        const isMobile = window.innerWidth <= 768;
        const carousel = document.getElementById('infinite-carousel');
        
        if (carousel) {
            if (isMobile) {
                // Mobile optimizations
                document.body.classList.add('mobile-device');
                carousel.style.transform = 'translateX(20px)';
                carousel.classList.add('mobile-optimized');
                
                // Adjust animation duration for mobile
                const currentDuration = window.innerWidth <= 480 ? '30s' : '35s';
                carousel.style.animationDuration = currentDuration;
            } else {
                // Desktop optimizations
                document.body.classList.remove('mobile-device');
                carousel.style.transform = 'translateX(0)';
                carousel.classList.remove('mobile-optimized');
                carousel.style.animationDuration = '45s';
            }
        }
        
        // Re-render carousel if needed
        if (this.validBooks && this.validBooks.length > 0) {
            this.renderInfiniteCarousel();
        }
    }

    // Typewriter Effect
    startTypewriterEffect() {
        const typewriterElement = document.getElementById('typewriter-text');
        let currentText = '';
        let currentIndex = 0;
        let isDeleting = false;
        
        const typewrite = () => {
            const fullText = this.typewriterTexts[this.currentTypewriterIndex];
            
            if (isDeleting) {
                currentText = fullText.substring(0, currentText.length - 1);
            } else {
                currentText = fullText.substring(0, currentText.length + 1);
            }
            
            typewriterElement.textContent = currentText;
            
            let typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && currentText === fullText) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && currentText === '') {
                isDeleting = false;
                this.currentTypewriterIndex = (this.currentTypewriterIndex + 1) % this.typewriterTexts.length;
                typeSpeed = 500; // Pause before typing next text
            }
            
            setTimeout(typewrite, typeSpeed);
        };
        
        typewrite();
    }

    // Roman Analog Clock Display
    startRomanClock() {
        const updateClock = () => {
            const now = new Date();
            
            // Get time components
            const hours = now.getHours() % 12;
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            
            // Calculate angles for hands (360 degrees = full circle)
            const hourAngle = (hours * 30) + (minutes * 0.5); // 30 degrees per hour + minute adjustment
            const minuteAngle = minutes * 6; // 6 degrees per minute
            const secondAngle = seconds * 6; // 6 degrees per second
            
            // Update hand positions smoothly
            const hourHand = document.getElementById('hour-hand');
            const minuteHand = document.getElementById('minute-hand');
            const secondHand = document.getElementById('second-hand');
            
            if (hourHand) {
                hourHand.style.transform = `rotate(${hourAngle}deg)`;
            }
            if (minuteHand) {
                minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
            }
            if (secondHand) {
                secondHand.style.transform = `rotate(${secondAngle}deg)`;
            }
            
            // Update date display
            const options = { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            };
            const currentDate = now.toLocaleDateString('en-US', options);
            const dateElement = document.getElementById('roman-clock-date');
            if (dateElement) {
                dateElement.textContent = currentDate;
            }
            
            // Update mobile clock if it exists
            this.updateMobileClockWithAnimation(
                String(now.getHours()).padStart(2, '0'),
                String(minutes).padStart(2, '0'),
                String(seconds).padStart(2, '0'),
                currentDate
            );
        };
        
        // Initial update
        updateClock();
        
        // Update every second
        setInterval(updateClock, 1000);
    }

    updateTimeWithAnimation(elementId, newValue, previousValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (newValue !== previousValue) {
            // Add rolling animation class
            element.classList.add('rolling-digit', 'flip');
            
            // Update the value
            element.textContent = newValue;
            
            // Remove animation class after animation completes
            setTimeout(() => {
                element.classList.remove('flip');
            }, 600);
        }
    }

    updateMobileClockWithAnimation(hours, minutes, seconds, date) {
        // Update mobile clock elements with animation
        this.updateClockElement('mobile-hours', hours, this.previousMobileHours);
        this.updateClockElement('mobile-minutes', minutes, this.previousMobileMinutes);
        this.updateClockElement('mobile-seconds', seconds, this.previousMobileSeconds);
        
        // Update mobile date
        const mobileDateElement = document.getElementById('mobile-live-date');
        if (mobileDateElement && date !== this.previousMobileDate) {
            mobileDateElement.textContent = date;
        }
        
        // Store previous values
        this.previousMobileHours = hours;
        this.previousMobileMinutes = minutes;
        this.previousMobileSeconds = seconds;
        this.previousMobileDate = date;
    }

    updateClockElement(elementId, newValue, previousValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (newValue !== previousValue) {
            // Add rolling animation class
            element.classList.add('flip');
            
            // Update the value
            element.textContent = newValue;
            
            // Remove animation class after animation completes
            setTimeout(() => {
                element.classList.remove('flip');
            }, 600);
        } else if (!element.textContent || element.textContent === '--') {
            // Initial load
            element.textContent = newValue;
        }
    }

    // Infinite Horizontal Carousel functionality
    initializeCarousel() {
        if (this.books.length > 0) {
            this.filterBooksWithImages().then(() => {
                this.renderInfiniteCarousel();
                this.setupCarouselControls();
            });
        }
    }

    setupCarouselControls() {
        const carousel = document.getElementById('infinite-carousel');
        
        // Initialize status
        this.updateCarouselStatus();
        
        // Pause on hover
        carousel.addEventListener('mouseenter', () => {
            if (this.isAutoplayActive) {
                carousel.style.animationPlayState = 'paused';
            }
        });
        
        carousel.addEventListener('mouseleave', () => {
            if (this.isAutoplayActive) {
                carousel.style.animationPlayState = 'running';
            }
        });
    }

    updateCarouselStatus() {
        // Status display removed - functionality maintained through button states
        const icon = document.getElementById('autoplay-icon');
        const button = document.getElementById('carousel-autoplay-toggle');
        
        if (this.isAutoplayActive) {
            if (icon) icon.className = 'fas fa-pause';
            if (button) button.title = 'Pause auto-play';
        } else {
            if (icon) icon.className = 'fas fa-play';
            if (button) button.title = 'Start auto-play';
        }
    }

    renderInfiniteCarousel() {
        const carousel = document.getElementById('infinite-carousel');
        const bookCount = document.getElementById('carousel-book-count');
        
        if (!this.validBooks || this.validBooks.length === 0) {
            carousel.innerHTML = '<p class="text-gray-500 dark:text-gray-400 p-8">No featured books available</p>';
            if (bookCount) {
                bookCount.textContent = '0 Books';
            }
            return;
        }

        // Duplicate books for infinite scroll effect
        const duplicatedBooks = [...this.validBooks, ...this.validBooks];
        
        carousel.innerHTML = duplicatedBooks.map((book, index) => `
            <div class="infinite-book-card" onclick="window.bookStore.openBookDetails(${book.id})" data-book-id="${book.id}">
                <div class="infinite-book-cover">
                    <img src="${book.coverImage}" alt="${book.title}" class="w-full h-full object-cover" loading="lazy">
                </div>
                <div class="infinite-book-info">
                    <div class="infinite-book-genre">${book.genre.split(',')[0].trim()}</div>
                    <h4 class="infinite-book-title">${book.title}</h4>
                    <p class="infinite-book-author">by ${book.author}</p>
                    <div class="infinite-book-stats">
                        <span><i class="fas fa-calendar mr-1 text-primary"></i>${new Date(book.publishedDate).getFullYear()}</span>
                        <span><i class="fas fa-book mr-1 text-secondary"></i>${book.pageCount}p</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Update book count (if element exists)
        if (bookCount) {
            bookCount.textContent = `${this.validBooks.length} Books`;
        }
    }

    toggleAutoplay() {
        this.isAutoplayActive = !this.isAutoplayActive;
        const icon = document.getElementById('autoplay-icon');
        const button = document.getElementById('carousel-autoplay-toggle');
        const carousel = document.getElementById('infinite-carousel');
        
        if (this.isAutoplayActive) {
            if (icon) icon.className = 'fas fa-pause';
            if (button) button.title = 'Pause auto-play';
            if (carousel) carousel.style.animationPlayState = 'running';
        } else {
            if (icon) icon.className = 'fas fa-play';
            if (button) button.title = 'Start auto-play';
            if (carousel) carousel.style.animationPlayState = 'paused';
        }
    }

    async filterBooksWithImages() {
        this.validBooks = [];
        
        // Try to get 10 books with valid images
        for (const book of this.books.slice(0, 20)) { // Check first 20 books to get 10 valid ones
            if (this.validBooks.length >= 10) break; // Stop when we have 10 books
            
            try {
                const imageValid = await this.checkImageUrl(book.coverImage);
                if (imageValid) {
                    this.validBooks.push(book);
                    console.log(`Valid book added: ${book.title}`);
                }
            } catch (error) {
                console.log(`Invalid image for book: ${book.title}`);
            }
        }
        
        // If still not enough books, add some without image validation
        if (this.validBooks.length < 10) {
            const remainingBooks = this.books.slice(0, 15).filter(book => 
                !this.validBooks.some(validBook => validBook.id === book.id)
            );
            
            this.validBooks.push(...remainingBooks.slice(0, 10 - this.validBooks.length));
        }
        
        console.log(`Filtered books count: ${this.validBooks.length}`);
    }

    checkImageUrl(url) {
        return new Promise((resolve) => {
            // Quick check for common valid image patterns
            const isValidImageUrl = url && (
                url.includes('unsplash.com') ||
                url.includes('googleapis.com') ||
                url.includes('covers.openlibrary.org') ||
                url.startsWith('data:image') ||
                url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
            );
            
            if (!isValidImageUrl) {
                resolve(false);
                return;
            }
            
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            
            // Shorter timeout for faster loading
            setTimeout(() => resolve(false), 2000);
        });
    }

    // Contact Form functionality
    handleContactForm(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contact-name').value.trim(),
            email: document.getElementById('contact-email').value.trim(),
            subject: document.getElementById('contact-subject').value.trim(),
            message: document.getElementById('contact-message').value.trim()
        };
        
        // Validate all fields
        let isValid = true;
        Object.keys(formData).forEach(field => {
            if (!this.validateContactField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showToast('Please fix the errors in the form', 'error');
            return;
        }
        
        // Simulate form submission
        this.submitContactForm(formData);
    }

    validateContactField(fieldName) {
        const field = document.getElementById(`contact-${fieldName}`);
        const errorElement = document.getElementById(`${fieldName}-error`);
        const value = field.value.trim();
        
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'name':
                if (!value) {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters';
                    isValid = false;
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else if (!emailRegex.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;
                
            case 'subject':
                if (!value) {
                    errorMessage = 'Subject is required';
                    isValid = false;
                } else if (value.length < 5) {
                    errorMessage = 'Subject must be at least 5 characters';
                    isValid = false;
                }
                break;
                
            case 'message':
                if (!value) {
                    errorMessage = 'Message is required';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters';
                    isValid = false;
                }
                break;
        }
        
        if (isValid) {
            field.classList.remove('border-red-500');
            field.classList.add('border-green-500');
            errorElement.classList.add('hidden');
        } else {
            field.classList.remove('border-green-500');
            field.classList.add('border-red-500');
            errorElement.textContent = errorMessage;
            errorElement.classList.remove('hidden');
        }
        
        return isValid;
    }

    async submitContactForm(formData) {
        const submitBtn = document.getElementById('contact-submit');
        const submitText = document.getElementById('submit-text');
        
        // Show loading state
        submitBtn.disabled = true;
        submitText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Reset form
            document.getElementById('contact-form').reset();
            
            // Remove validation styles
            ['name', 'email', 'subject', 'message'].forEach(field => {
                const fieldElement = document.getElementById(`contact-${field}`);
                fieldElement.classList.remove('border-green-500', 'border-red-500');
                document.getElementById(`${field}-error`).classList.add('hidden');
            });
            
            this.showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
            
        } catch (error) {
            this.showToast('Failed to send message. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitText.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send Message';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookStore = new BookStore();
});

// Add CSS for line-clamp utility
const style = document.createElement('style');
style.textContent = `
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;
document.head.appendChild(style);