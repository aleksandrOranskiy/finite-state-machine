class FSM {
    /**
     * Creates new FSM instance.
     * @param config
     */
    constructor(config = null) {

        if (config === null) {
            throw new Error("Config is null");
        }

        function copy(o) {
            function F() {}
            F.prototype = o;
            return new F();
        }

        this.config = copy(config);
        this.activeState = this.config.initial;
        this.stackStates = new Array();
        this.stackStates.push(this.config.initial);
        this.undoCallCount = 0;
        this.isUndoActive = false;
        this.isRedoActive = false;
        this.stackOperations = new Array();
    }

    /**
     * Returns active state.
     * @returns {String}
     */
    getState() {

        return this.activeState;
    }

    /**
     * Goes to specified state.
     * @param state
     */
    changeState(state) { // stackOperations = 0

        var isChange = false;
        for (var key in this.config.states) {
            if (key === state) {
                
                this.stackStates.push(state);
                this.activeState = state;
                isChange = true;
                if (this.isUndoActive) {
                    this.isUndoActive = false;
                    this.stackOperations.push(1);
                } else if (this.isRedoActive) {
                    this.isRedoActive = false;
                } else {
                    this.stackOperations.push(0);
                }
            }
        }

        if (!isChange) {
            throw new Error("Incorrect state");
        }

    }

    /**
     * Changes state according to event transition rules.
     * @param event
     */
    trigger(event) { // stackOperations = 0

        var isChange = false;
        for (var key in this.config.states[this.activeState].transitions) {
            if (key === event) {
                this.changeState(this.config.states[this.activeState].transitions[event]);
                isChange = true;
            }
        }

        if (!isChange) {
            throw new Error("Incorrect event");
        }
    }

    /**
     * Resets FSM state to initial.
     */
    reset() { // stackOperations = 2

        this.activeState = this.config.initial;
        this.stackOperations.push(2);
    }

    /**
     * Returns an array of states for which there are specified event transition rules.
     * Returns all states if argument is undefined.
     * @param event
     * @returns {Array}
     */
    getStates(event = null) {

        var states = new Array();

        if (event === null) {

            var i = 0;

            for (var key in this.config.states) {
                states[i++] = key;
            }

        } else {

          var i = 0;

            for (var keyState in this.config.states) {
                for (var keyTrans in this.config.states[keyState].transitions) {
                    if (event === keyTrans) {
                        states[i++] = keyState;
                    }
                }
            }
        }

        return states;
    }

    /**
     * Goes back to previous state.
     * Returns false if undo is not available.
     * @returns {Boolean}
     */
    undo() { // stackOperations = 1

        if (((this.stackStates.length - this.undoCallCount * 2) !== 1) && (this.stackStates.length !== 0)) {

            this.isUndoActive = true;
            this.changeState(this.stackStates[this.stackStates.length-2]);
            ++this.undoCallCount;

            return true;

        } else {

            return false;
        }
    }

    /**
     * Goes redo to state.
     * Returns false if redo is not available.
     * @returns {Boolean}
     */
    redo() {

        if ((this.stackStates.length !== 1) && (this.stackOperations[this.stackOperations.length-1] !== 0)) {

            this.isRedoActive = true;
            if (this.stackOperations[this.stackOperations.length-1] === 1) {
                this.stackOperations.pop();
                this.changeState(this.stackStates[this.stackStates.length-2]);
            } else {
                this.changeState(this.stackStates[this.stackStates.length-2]);
            }

            return true;

        } else {

            return false;
        }
    }

    /**
     * Clears transition history
     */
    clearHistory() {

        this.stackStates.length = 1;
    }
}

module.exports = FSM;

/** @Created by Uladzimir Halushka **/

