import * as React from 'react';
import "./LoadingSpinner.css"

function LoadingSpinner() {
    return (
        <div className="lds-grid">
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
        </div>
    );
}

export default LoadingSpinner;