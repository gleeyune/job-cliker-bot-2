// Function to get user IP address using a third-party IP geolocation API
async function getUserIPAddress() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  }
  
  // Function to search for "waiting for review" text and click on the corresponding link
  async function searchAndClick() {
    const links = Array.from(document.querySelectorAll('a'));
    const textsToSearch = ['waiting for review', 'waiting for editing'];
    let found = false;
  
    for (const link of links) {
      const linkText = link.innerText.toLowerCase();
  
      if (textsToSearch.some(text => linkText.includes(text))) {
        link.click();
        found = true;
        break;
      }
    }
  
    if (!found) {
      console.log('Job not found: ' + textsToSearch.join(', '));
    
      //logToFirebase('Text not found: ' + textToSearch);
    } else {
      try {
        // Get the user's IP address
        const ipAddress = await getUserIPAddress();
        
        // Get browser details
        const browser = getBrowserDetails();
        
        // Get operating system
        const operatingSystem = getOperatingSystem();
        
        // Combine user details into a message
        const message = `User Details:
          IP Address: ${ipAddress}
          Browser: ${browser}
          Operating System: ${operatingSystem}`;
          
        // Send a message after clicking on the link
        sendTelegramMessage(message);
      } catch (error) {
        console.error('Error retrieving user details:', error);
      }
    }
  }
  
  // Function to get browser details
  function getBrowserDetails() {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent);
    return isChrome ? 'Chrome' : 'Unknown';
  }
  
  // Function to get operating system
  function getOperatingSystem() {
    const userAgent = navigator.userAgent;
    let operatingSystem = 'Unknown';
  
    if (userAgent.indexOf('Win') !== -1) {
      operatingSystem = 'Windows';
    } else if (userAgent.indexOf('Mac') !== -1) {
      operatingSystem = 'MacOS';
    } else if (userAgent.indexOf('Linux') !== -1) {
      operatingSystem = 'Linux';
    } else if (userAgent.indexOf('Android') !== -1) {
      operatingSystem = 'Android';
    } else if (userAgent.indexOf('iOS') !== -1) {
      operatingSystem = 'iOS';
    }
  
    return operatingSystem;
  }
  
  // Function to send a message via Telegram API
  function sendTelegramMessage(message) {
    const botToken = '6131316580:AAEJep-sbO3dV1HZ0uHvn6Ts4WPpIZB4o3M';
    const chatId = '1816900856';
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to send Telegram message');
        }
      })
      .catch(error => {
        console.error(error);
      });
  }
  
  // Function to start observing DOM changes
  function startObserving() {
    observer = new MutationObserver(searchAndClick);
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Function to stop observing DOM changes
  function stopObserving() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === 'start') {
      startObserving();
    } else if (message.action === 'stop') {
      stopObserving();
    }
  });
  
  // Start observing DOM changes immediately
  startObserving();
  