/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load and execute script.js in the global scope
const scriptPath = path.join(__dirname, 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Remove window.onload to prevent it from running during tests
const scriptWithoutOnload = scriptContent.replace(/window\.onload\s*=\s*function\s*\(\)\s*\{[\s\S]*?\};?\s*$/, '');

// Execute the modified script in the current context
eval(scriptWithoutOnload);

describe('validateUsername', () => {
    let usernameInput;
    let errorDiv;
    let alertSpy;

    beforeEach(() => {
        // Set up DOM elements
        document.body.innerHTML = `
            <input type="text" id="username" />
            <div id="username-error" style="display: none;"></div>
        `;
        usernameInput = document.getElementById('username');
        errorDiv = document.getElementById('username-error');

        // Mock alert
        alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
    });

    afterEach(() => {
        alertSpy.mockRestore();
    });

    describe('Valid usernames', () => {
        test('should validate username with all requirements met', () => {
            usernameInput.value = 'Test123!';
            const result = validateUsername(false);

            expect(result).toBe(true);
            expect(usernameInput.classList.contains('is-valid')).toBe(true);
            expect(usernameInput.classList.contains('is-invalid')).toBe(false);
            expect(errorDiv.style.display).toBe('none');
        });

        test('should validate username with minimum 8 characters', () => {
            usernameInput.value = 'Abc123@#';
            const result = validateUsername(false);

            expect(result).toBe(true);
            expect(usernameInput.classList.contains('is-valid')).toBe(true);
        });

        test('should validate username with multiple special characters', () => {
            usernameInput.value = 'Test123!@#$%';
            const result = validateUsername(false);

            expect(result).toBe(true);
            expect(usernameInput.classList.contains('is-valid')).toBe(true);
        });

        test('should validate username with all allowed special characters', () => {
            usernameInput.value = 'Pass1@$!%*?&#';
            const result = validateUsername(false);

            expect(result).toBe(true);
        });

        test('should show success alert when showAlert is true', () => {
            usernameInput.value = 'Valid123!';
            validateUsername(true);

            expect(alertSpy).toHaveBeenCalledWith('✓ Username "Valid123!" is valid and accepted!');
        });

        test('should not show alert when showAlert is false', () => {
            usernameInput.value = 'Valid123!';
            validateUsername(false);

            expect(alertSpy).not.toHaveBeenCalled();
        });
    });

    describe('Invalid usernames - Missing requirements', () => {
        test('should reject username with less than 8 characters', () => {
            usernameInput.value = 'Ab12!';
            const result = validateUsername(false);

            expect(result).toBe(false);
            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
            expect(usernameInput.classList.contains('is-valid')).toBe(false);
            expect(errorDiv.style.display).toBe('block');
        });

        test('should reject username without uppercase letter', () => {
            usernameInput.value = 'test123!';
            const result = validateUsername(false);

            expect(result).toBe(false);
            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
        });

        test('should reject username without lowercase letter', () => {
            usernameInput.value = 'TEST123!';
            const result = validateUsername(false);

            expect(result).toBe(false);
            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
        });

        test('should reject username without number', () => {
            usernameInput.value = 'TestTest!';
            const result = validateUsername(false);

            expect(result).toBe(false);
            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
        });

        test('should reject username without special character', () => {
            usernameInput.value = 'Test1234';
            const result = validateUsername(false);

            expect(result).toBe(false);
            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
        });

        test('should reject username with invalid special character', () => {
            usernameInput.value = 'Test123^';
            const result = validateUsername(false);

            expect(result).toBe(false);
        });

        test('should show failure alert when showAlert is true', () => {
            usernameInput.value = 'invalid';
            validateUsername(true);

            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining('✗ Username validation failed!')
            );
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining('Minimum 8 characters')
            );
        });
    });

    describe('Edge cases', () => {
        test('should handle empty username', () => {
            usernameInput.value = '';
            const result = validateUsername(false);

            expect(result).toBe(false);
            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
        });

        test('should handle exactly 8 characters with all requirements', () => {
            usernameInput.value = 'Test123!';
            const result = validateUsername(false);

            expect(result).toBe(true);
        });

        test('should handle whitespace in username', () => {
            usernameInput.value = 'Test 123!';
            const result = validateUsername(false);

            expect(result).toBe(false);
        });

        test('should handle very long valid username', () => {
            usernameInput.value = 'Test1234567890!@#$%ValidLongUsername';
            const result = validateUsername(false);

            expect(result).toBe(true);
        });
    });

    describe('CSS class management', () => {
        test('should remove is-invalid and add is-valid for valid input', () => {
            usernameInput.classList.add('is-invalid');
            usernameInput.value = 'Valid123!';

            validateUsername(false);

            expect(usernameInput.classList.contains('is-valid')).toBe(true);
            expect(usernameInput.classList.contains('is-invalid')).toBe(false);
        });

        test('should remove is-valid and add is-invalid for invalid input', () => {
            usernameInput.classList.add('is-valid');
            usernameInput.value = 'invalid';

            validateUsername(false);

            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
            expect(usernameInput.classList.contains('is-valid')).toBe(false);
        });
    });

    describe('Multiple validation calls', () => {
        test('should handle switching from valid to invalid', () => {
            usernameInput.value = 'Valid123!';
            let result = validateUsername(false);
            expect(result).toBe(true);

            usernameInput.value = 'invalid';
            result = validateUsername(false);
            expect(result).toBe(false);
            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
        });

        test('should handle switching from invalid to valid', () => {
            usernameInput.value = 'invalid';
            let result = validateUsername(false);
            expect(result).toBe(false);

            usernameInput.value = 'Valid123!';
            result = validateUsername(false);
            expect(result).toBe(true);
            expect(usernameInput.classList.contains('is-valid')).toBe(true);
        });
    });
});

