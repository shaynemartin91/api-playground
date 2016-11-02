module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
        "no-prototype-builtins": 0,
        "new-cap": [2, {
            "capIsNewExceptionPattern": "^express\.."
        }],
        "class-methods-use-this": ["error", { 
            "exceptMethods": ["validationMessage"] 
        }]


    }
};