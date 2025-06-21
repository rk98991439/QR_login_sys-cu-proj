const switchers = [...document.querySelectorAll('.switcher')];

switchers.forEach(item => {
	item.addEventListener('click', function () {
		switchers.forEach(item => item.parentElement.classList.remove('is-active'));
		this.parentElement.classList.add('is-active');
	});
});

// Switch to signup form
function switchToSignup() {
	switchers.forEach(item => item.parentElement.classList.remove('is-active'));
	document.querySelector('.switcher-signup').parentElement.classList.add('is-active');
}

// Toggle password visibility
function togglePassword(inputId) {
	const input = document.getElementById(inputId);
	input.type = input.type === 'password' ? 'text' : 'password';
}

// Password strength checker
function checkPasswordStrength() {
	const password = document.getElementById('signup-password').value;
	const strengthIndicator = document.getElementById('password-strength');
	let strength = '';

	if (password.length < 6) {
		strength = 'Weak';
	} else if (password.length >= 6 && /[A-Z]/.test(password) && /\d/.test(password)) {
		strength = 'Medium';
	} else if (password.length > 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*]/.test(password)) {
		strength = 'Strong';
	}

	strengthIndicator.textContent = strength ? `Password Strength: ${strength}` : '';
}

// Debounce function for QR code generation
function debounce(func, delay) {
	let timeoutId;
	return function (...args) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func.apply(this, args), delay);
	};
}

// Read QR code and auto-fill login form
function readQRCode(files) {
	const resultContainer = document.getElementById('qr-result');
	const loadingDiv = document.getElementById('qr-loading');
	const loginEmail = document.getElementById('login-email');
	const loginPassword = document.getElementById('login-password');
	const loginForm = document.getElementById('login-form');
	loadingDiv.style.display = 'block';
	resultContainer.textContent = '';

	if (files && files[0]) {
		const apiUrl = 'https://api.qrserver.com/v1/read-qr-code/';
		const formData = new FormData();
		formData.append('file', files[0]);

		fetch(apiUrl, { method: 'POST', body: formData })
			.then(response => response.json())
			.then(data => {
				loadingDiv.style.display = 'none';
				if (data[0].symbol[0].error) {
					resultContainer.textContent = `Error: ${data[0].symbol[0].error}`;
				} else {
					const qrData = data[0].symbol[0].data;
					const regex = /^Email: (.+)\nPassword: (.+)$/;
					const match = qrData.match(regex);
					if (match) {
						const email = match[1];
						const password = match[2];
						if (email.endsWith('@cuchd.in')) {
							loginEmail.value = email;
							loginPassword.value = password;
							resultContainer.textContent = 'Credentials loaded, logging in...';
							setTimeout(() => {
								loginForm.dispatchEvent(new Event('submit'));
							}, 1000);
						} else {
							resultContainer.textContent = 'Invalid email format in QR code';
						}
					} else {
						resultContainer.textContent = 'Invalid QR code format';
					}
				}
			})
			.catch(error => {
				loadingDiv.style.display = 'none';
				resultContainer.textContent = 'Failed to read QR code';
				console.error(error);
			});
	} else {
		loadingDiv.style.display = 'none';
	}
}

// Generate QR code
const generateQRCode = debounce(() => {
	const email = document.getElementById('signup-email').value;
	const password = document.getElementById('signup-password').value;
	const confirmPassword = document.getElementById('signup-password-confirm').value;
	const qrCodeImg = document.getElementById('qrcode');
	const downloadLink = document.getElementById('download-link');
	const qrLoadingDiv = document.getElementById('qr-loading-signup');
	const qrErrorDiv = document.getElementById('qr-error');

	if (password !== confirmPassword) {
		qrErrorDiv.style.display = 'block';
		qrCodeImg.src = '';
		downloadLink.href = '#';
		qrLoadingDiv.style.display = 'none';
		return;
	}

	qrErrorDiv.style.display = 'none';

	if (email && password) {
		qrLoadingDiv.style.display = 'block';
		const qrData = `Email: ${email}\nPassword: ${password}`;
		const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
		qrCodeImg.src = apiUrl;
		downloadLink.dataset.qrUrl = apiUrl; // Store URL for download
		qrLoadingDiv.style.display = 'none';
	} else {
		qrCodeImg.src = '';
		downloadLink.href = '#';
		downloadLink.dataset.qrUrl = '';
		qrLoadingDiv.style.display = 'none';
	}
}, 500);

// Download QR code
const downloadLink = document.getElementById('download-link');
const qrcodeImage = document.getElementById('qrcode');
downloadLink.addEventListener('click', async (e) => {
	e.preventDefault();
	const qrUrl = downloadLink.dataset.qrUrl;

	if (!qrUrl || !qrcodeImage.src || qrcodeImage.src === window.location.href) {
		alert('No QR code generated yet!');
		return;
	}

	try {
		const response = await fetch(qrUrl);
		if (!response.ok) throw new Error('Failed to fetch QR code');
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'qrcode.png';
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	} catch (error) {
		alert('Failed to download QR code. Please try again.');
		console.error(error);
	}
});

// Form validation and submission
document.getElementById('signup-form').addEventListener('submit', (e) => {
	e.preventDefault();
	const email = document.getElementById('signup-email').value;
	const password = document.getElementById('signup-password').value;
	const confirmPassword = document.getElementById('signup-password-confirm').value;
	const submitButton = document.getElementById('signup-submit');

	if (!email.endsWith('@cuchd.in')) {
		alert('Please use a valid CU email address ending with @cuchd.in');
		return;
	}

	if (password !== confirmPassword) {
		alert('Passwords do not match!');
		return;
	}

	submitButton.disabled = true;
	// Simulate backend submission
	setTimeout(() => {
		alert('Signup successful!');
		submitButton.disabled = false;
	}, 2000);
});

document.getElementById('login-form').addEventListener('submit', (e) => {
	e.preventDefault();
	const email = document.getElementById('login-email').value;
	const submitButton = document.getElementById('login-submit');

	if (!email.endsWith('@cuchd.in')) {
		alert('Please use a valid CU email address ending with @cuchd.in');
		return;
	}

	submitButton.disabled = true;
	// Simulate backend submission
	setTimeout(() => {
		alert('Login successful!');
		submitButton.disabled = false;
	}, 2000);
});

// Event listeners
document.getElementById('qr-input').addEventListener('change', (e) => readQRCode(e.target.files));
document.getElementById('signup-email').addEventListener('input', generateQRCode);
document.getElementById('signup-password').addEventListener('input', () => {
	generateQRCode();
	checkPasswordStrength();
});
document.getElementById('signup-password-confirm').addEventListener('input', generateQRCode);