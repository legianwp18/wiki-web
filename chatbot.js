const URL_API = "http://localhost:3000"
let threadIds = [];

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize chat elements
    window.chatMessages = document.getElementById('chatMessages');
    window.userInput = document.getElementById('userInput');
    
    // Enter key to send message in chatbot
    if (userInput) {
        userInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }
    //Get data assistant
    fetchDataFromAPI();

    //Get data unanswered
    fetchDataUnansweredFromAPI();
    
    // Set up main menu navigation
    setupMainNavigation();
    
    // Set up submenu navigation
    setupSubNavigation();
    
    // Set up modals
    setupModals();

    setupFeedbackButtons();
});

// Menampilkan data dalam tabel
function displayData(dataList) {
    const tbody = document.getElementById('dataList');
    tbody.innerHTML = '';
    
    if (!dataList || dataList.length === 0) {
        tbody.innerHTML = '<div class="table-row"><div class="td-col title-col"></div></div>';
        return;
    }
    
    dataList.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <div class="table-row">
                <div class="td-col title-col"> ${data.name}</div>
                <div class="td-col file-col"><button class="view-btn"><i>👁️</i></button></div>
                <div class="td-col action-col">
                    <span class="edit-icon" data-id="${data._id}" onclick="editData('${data._id}')" data-title="Edit">✏️</span>
                </div>
            </div>
        `;
        tbody.appendChild(row);
    });
}

function displayDataUnanswered(dataList) {
    const tbody = document.getElementById('unansweredList');
    tbody.innerHTML = '';
    
    if (!dataList || dataList.length === 0) {
        tbody.innerHTML = '<div class="table-row"><div class="td-col title-col"></div></div>';
        return;
    }
    
    dataList.forEach(data => {
        const row = document.createElement('tr');
        const date = dayjs(data.createdAt);
        const formattedDate = date.format('YYYY-MM-DD HH:mm:ss');
        row.innerHTML = `
            <div class="table-row">
                <div class="td-col title-col">${formattedDate}</div>
                <div class="td-col title-col">dummy@gmail.com</div>
                <div class="td-col title-col">${data.question}</div>
                <div class="td-col action-col">
                    <span class="edit-icon" data-id="${data._id}" onclick="updateUnanswered('${data._id}', ${data.updated})" data-title="Edit"><input type="checkbox" ${data.updated ? 'checked' : ''}></span>
                </div>
            </div>
        `;
        tbody.appendChild(row);
    });
}

function updateFileName(input) {
    debugger;
    if (input.files && input.files[0]) {
        const fileName = input.files[0].name;
        document.getElementById('fileInfo').textContent = fileName;
    } else {
        document.getElementById('fileInfo').textContent = 'Attach documents';
    }
}


// Function to upload file to API
async function uploadFile() {
    const titleInput = document.getElementById('newTitleInput');
    const fileInput = document.getElementById('fileAttachment');
    const submitBtn = document.querySelector('.submit-btn');
    const addModal = document.getElementById("addModal")
    
    // Validate inputs
    if (!titleInput.value.trim()) {
        alert('Please enter a title');
        return;
    }
    
    if (fileInput.files.length === 0) {
        alert('Please select a file');
        return;
    }

    // Check file size (10MB limit)
    const file = fileInput.files[0];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
        alert(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB)`);
        return;
    }
    
    // Disable submit button and show loading state
    const originalBtnText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Uploading...';
    submitBtn.disabled = true;
    
    try {
        // Create FormData to send file
        const formData = new FormData();
        formData.append('name', titleInput.value.trim());
        formData.append('files', fileInput.files[0]);
        
        // Send data to API
        const response = await fetch(`${URL_API}/upload`, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Upload successful:', result);
        
        // Show success message
        alert('File uploaded successfully!');
        
        // Close modal
        addModal.closest('.modal').classList.remove('active');
        
        // Refresh file list if needed
        // refreshFileList(); // Implement this function to refresh your file list
        
    } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Upload failed: ${error.message}`);
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Menampilkan loader
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// Menampilkan pesan error
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        errorElement.style.display = 'none';
    }
}

// Mengambil data dari API
async function fetchDataFromAPI() {
    showLoading(true);
    showError('');
    
    try {

        const response = await fetch(`${URL_API}/files`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'connect.sid=s%3Awb1s6ZqAl3Lb7Ob0tg7tZv7l4iChc6BW.zeX3HeAV3jraGlpPU6ZnuSP%2BvFLkrE2a1cPUQHDRK9c'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const response_data = await response.json();

        displayData(response_data.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        showError(`Gagal memuat data: ${error.message}`);
        
        // Tampilkan data dummy jika API tidak tersedia (untuk demo saja)
        const dummyData = [
            // { id: 1, name: 'Employee Handbook' },
            // { id: 2, name: 'Employee Handbook 2'}
        ];
        displayData(dummyData);
    } finally {
        showLoading(false);
    }
}

async function fetchDataUnansweredFromAPI() {
    showLoading(true);
    showError('');
    
    try {

        const response = await fetch(`${URL_API}/unanswered`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'connect.sid=s%3Awb1s6ZqAl3Lb7Ob0tg7tZv7l4iChc6BW.zeX3HeAV3jraGlpPU6ZnuSP%2BvFLkrE2a1cPUQHDRK9c'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const response_data = await response.json();

        displayDataUnanswered(response_data.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        showError(`Gagal memuat data: ${error.message}`);
        
        // Tampilkan data dummy jika API tidak tersedia (untuk demo saja)
        const dummyData = [
            // { id: 1, name: 'Employee Handbook' },
            // { id: 2, name: 'Employee Handbook 2'}
        ];
        displayDataUnanswered(dummyData);
    } finally {
        showLoading(false);
    }
}

// Set up main menu navigation
function setupMainNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all menu items
            menuItems.forEach(mi => mi.classList.remove('active'));
            
            // Add active class to clicked menu item
            this.classList.add('active');
            
            // Update header title
            const sectionName = this.textContent.trim();
            document.getElementById('headerTitle').textContent = sectionName;
            
            // Here you would load the corresponding section
            // For this demo, we're only implementing the Employee Handbook section
            
            // Check if we're selecting Employee Handbook
            const section = this.getAttribute('data-section');
            if (section === 'employee-handbook') {
                // Show the first submenu content by default
                showContent('company-structure');
            }
        });
    });
}

// Set up submenu navigation
function setupSubNavigation() {
    const subMenuItems = document.querySelectorAll('.pink-sidebar-item');
    
    subMenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all submenu items
            subMenuItems.forEach(smi => smi.classList.remove('active'));
            
            // Add active class to clicked submenu item
            this.classList.add('active');
            
            // Get content ID to show
            const contentId = this.getAttribute('data-content');
            
            // Show the selected content
            showContent(contentId);
        });
    });
}

// Show content based on ID and hide others
function showContent(contentId) {
    // Hide all content sections
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the selected content section
    const selectedContent = document.getElementById(contentId);
    if (selectedContent) {
        selectedContent.style.display = 'block';
        
        // If this is the chatbot section, focus on input
        if (contentId === 'chatbot' && window.userInput) {
            setTimeout(() => {
                window.userInput.focus();
            }, 100);
        }
    }
}

// Set up modals
function setupModals() {
    // Get modal elements
    const editModal = document.getElementById('editModal');
    const addModal = document.getElementById('addModal');
    const titleInput = document.getElementById('titleInput');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    const addNewBtn = document.getElementById('addNewBtn');
    
    // Add click event to all edit icons
    const editIcons = document.querySelectorAll('.edit-icon');
    editIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            // Set the title input value to the data-title attribute
            const title = this.getAttribute('data-title');
            titleInput.value = title;
            
            // Show the edit modal
            editModal.classList.add('active');
        });
    });
    
    // Add click event to the add new button
    if (addNewBtn) {
        addNewBtn.addEventListener('click', function() {
            // Show the add modal
            addModal.classList.add('active');
        });
    }
    
    // Add click events to close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Close parent modal
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Add click events to cancel buttons
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Close parent modal
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
}

async function editData(id) {
    showLoading(true);
    showError('');
    
    try {
        const response = await fetch(`${URL_API}/files/${id}`, {
            method: 'GET',
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const response_data = await response.json();
        const data = response_data.data;
        
        document.getElementById('editModal').classList.add('active');
        document.getElementById('_id').value = data._id;
        document.getElementById('newTitleInput').value = data.name;
        
    } catch (error) {
        console.error('Error fetching user data:', error);
        showError(`Gagal memuat data pengguna: ${error.message}`);
        
        // Demo: Buat data dummy untuk ditampilkan
        const dummyData = { 
            id: id, 
            nama: 'User ' + id, 
            email: `user${id}@example.com`, 
            status: id % 2 === 0 ? 'inactive' : 'active' 
        };
        
        document.getElementById('modalTitle').textContent = 'Edit Data';
        document.getElementById('dataId').value = dummyData.id;
        document.getElementById('nama').value = dummyData.nama;
        document.getElementById('email').value = dummyData.email;
        document.getElementById('status').value = dummyData.status;
        
        openModal('formModal');
    } finally {
        showLoading(false);
    }
}

async function updateUnanswered(id, update) {
    showLoading(true);
    showError('');

    const setUpdate = !update;
    
    try {
        const response = await fetch(`${URL_API}/unanswered/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                update: setUpdate
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const response_data = await response.json();
        const data = response_data.data;
        
    } catch (error) {
        console.error('Error fetching unanswered data:', error);
        showError(`Gagal memuat data unanswered: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Mengkonfirmasi dan menghapus data
async function deleteData(id) {
    try {
        const id = document.getElementById('_id').value;
        // Show confirmation dialog before deleting
        if (!confirm("Are you sure you want to delete this item?")) {
            return; // User canceled the deletion
        }

        
        // Optional: Show loading state
        const deleteBtn = document.querySelector(".delete-btn");
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.textContent = "Deleting...";
        }
        
        // Send delete request
        const response = await fetch(`${URL_API}/files/${id}`, {
            method: 'DELETE',
            // Add headers if needed for authentication
            headers: {
                'Content-Type': 'application/json'
                // 'Authorization': 'Bearer your-token-here'
            }
        });
        
        if (!response.ok) {
            // Try to get more detailed error message from server
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = errorData.message || errorData.error || '';
            } catch (e) {
                // Response wasn't JSON
            }
            
            throw new Error(`Server error (${response.status}): ${errorDetails || response.statusText}`);
        }
        
        // Success - close modal and refresh data
        document.getElementById('editModal').classList.remove('active');
        // Reload data
        fetchDataFromAPI(); // Make sure you have this function defined to refresh your table
        
        // Show success message
        alert("Data deleted successfully");
        
    } catch (error) {
        console.error("Delete error details:", error);
        
        // Show specific message based on error
        if (error.message.includes('500')) {
            alert("Gagal menghapus data: Internal server error. Server mungkin sedang mengalami masalah, silakan coba lagi nanti.");
        } else {
            alert(`Gagal menghapus data: ${error.message}`);
        }
    } finally {
        // Reset button state
        const deleteBtn = document.querySelector(".delete-btn");
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.textContent = "Delete";
        }
    }
}

// Send message function for chatbot
async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    // Add user message to chat
    addUserMessage(message);
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get response from API or fallback
        const response = await getResponse(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot message to chat
        addBotMessage(response);
        
        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error in sendMessage:', error);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add error message
        addBotMessage("Sorry, I encountered an error processing your request. Please try again later.");
        
        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Quick question buttons
async function sendQuickQuestion(question) {
    addUserMessage(question);
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get response from API
        const response = await getResponse(question);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot message to chat
        addBotMessage(response);
        
        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error in sendQuickQuestion:', error);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add error message
        addBotMessage("Sorry, I encountered an error processing your request. Please try again later.");
        
        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Add user message to chat
function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user-message');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    
    // Auto scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    
    // Convert markdown to HTML with proper formatting
    const formattedMessage = formatMessageContent(message);
    
    // Set the HTML content instead of text content
    messageElement.innerHTML = formattedMessage;
    
    // Add the message to the chat
    chatMessages.appendChild(messageElement);
    
    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Helper function to format the message content
function formatMessageContent(message) {
    // Replace numbered lists with properly formatted HTML list items
    let formatted = message.replace(/(\d+\.\s+\*\*.*?\*\*.*?)(?=\d+\.|$)/gs, 
        match => `<div class="tip-item">${match}</div>`);
    
    // Replace bold markdown with styled spans
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, 
        '<span class="highlight">$1</span>');
    
    // Format email addresses as links
    formatted = formatted.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        '<a href="mailto:$1">$1</a>');
    
    // Add a title for the tips section
    if (formatted.includes('tips')) {
        formatted = `<h3 class="tips-title">Laptop Care Tips</h3>${formatted}`;
    }
    
    return formatted;
}

// Show typing indicator
function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
    typingIndicator.id = 'typingIndicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('typing-dot');
        typingIndicator.appendChild(dot);
    }
    
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Show extended typing indicator for API calls
function showLongerTyping() {
    // Remove any existing typing indicator
    removeTypingIndicator();
    
    // Create a more elaborate typing indicator for API calls
    const typingContainer = document.createElement('div');
    typingContainer.classList.add('message', 'bot-message');
    typingContainer.id = 'typingIndicator';
    typingContainer.style.backgroundColor = '#f8f8f8';
    
    // Add animated text
    const typingText = document.createElement('div');
    typingText.innerHTML = 'Thinking <span class="searching-dots"><span>.</span><span>.</span><span>.</span></span>';
    typingText.style.display = 'flex';
    typingText.style.alignItems = 'center';
    typingContainer.appendChild(typingText);
    
    // Add the spinner animation
    const spinner = document.createElement('div');
    spinner.classList.add('api-spinner');
    spinner.innerHTML = '<div class="spinner-circle"></div>';
    typingContainer.appendChild(spinner);
    
    // Add to chat messages
    chatMessages.appendChild(typingContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getResponse(message) {
    try {
        showLongerTyping();
        
        const response = await fetch(`${URL_API}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'connect.sid=s%3Awb1s6ZqAl3Lb7Ob0tg7tZv7l4iChc6BW.zeX3HeAV3jraGlpPU6ZnuSP%2BvFLkrE2a1cPUQHDRK9c'
            },
            body: JSON.stringify({ question: message })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response;
        
    } catch (error) {
        console.error('Error:', error);
        return getFallbackResponse(message);
    }
}

// Fallback response function (used when API would normally fail)
function getFallbackResponse(message) {
    message = message.toLowerCase();
    
    // Default fallback response
    return "I don't have specific information about that in my database. Would you like me to forward your question to HR? Alternatively, you could check the Employee Handbook documents directly or try asking about company structure, training, leave policies, data security, non-conformance reporting, laptop care, seating plans, working areas, or social media guidelines.";
}

// Function to set up feedback buttons with modal
function setupFeedbackButtons() {
    const thumbsUpBtn = document.getElementById('thumbsUpBtn');
    const thumbsDownBtn = document.getElementById('thumbsDownBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackTitle = document.getElementById('feedbackTitle');
    const cancelFeedback = document.getElementById('cancelFeedback');
    const submitFeedback = document.getElementById('submitFeedback');
    const closeModal = document.querySelector('.close-modal');
    
    let currentFeedbackType = null;
    
    if (!thumbsUpBtn || !thumbsDownBtn) return;

    thumbsUpBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        
        if (thumbsDownBtn.classList.contains('active')) {
            thumbsDownBtn.classList.remove('active');
        }
        currentFeedbackType = this.classList.contains('active') ? true : null;
        feedbackTitle.textContent = "Thank you for the positive feedback!";
        feedbackModal.classList.add('active');
    });
    
    thumbsDownBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        if (thumbsUpBtn.classList.contains('active')) {
            thumbsUpBtn.classList.remove('active');
        }
        currentFeedbackType = this.classList.contains('active') ? false : null;
        feedbackTitle.textContent = "Sorry for your inconvenience :(";
        feedbackModal.classList.add('active');
    });
    
    submitFeedback.addEventListener('click', async function() {
        const feedbackText = document.getElementById('feedbackText').value;
        submitFeedback.disabled = true;
        submitFeedback.textContent = "Submitting...";
        
        try {
            await sendFeedbackToAPI({
                rating: currentFeedbackType,
                reason: feedbackText,
            });
            
            document.getElementById('feedbackText').value = '';
            feedbackModal.classList.remove('active');
        } catch (error) {
            console.error('Error sending feedback:', error);
            alert('There was an error submitting your feedback. Please try again.');
        } finally {
            submitFeedback.disabled = false;
            submitFeedback.textContent = "Submit";
        }
    });
    
    // Close modal handlers
    closeModal.addEventListener('click', () => feedbackModal.classList.remove('active'));
    cancelFeedback.addEventListener('click', () => feedbackModal.classList.remove('active'));
    window.addEventListener('click', (event) => {
        if (event.target === feedbackModal) {
            feedbackModal.classList.remove('active');
        }
    });
}

async function sendFeedbackToAPI(feedbackData) {
    const response = await fetch(`${URL_API}/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    setupFeedbackButtons();
});