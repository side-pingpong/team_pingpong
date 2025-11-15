// frontend/src/components/auth/AuthForm.js
import React from 'react';

function AuthForm({ title, buttonText, onSubmit, children }) {
    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit();
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                {children}
                <button type="submit">{buttonText}</button>
            </form>
        </div>
    );
}

export default AuthForm;
