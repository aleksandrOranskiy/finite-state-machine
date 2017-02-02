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
    changeState(state) {

        var isChange = false;
        for (var key in this.config.states) {
            if (key === state) {
                if (this.activeState !== state) {
                    this.stackStates.push(state);
                }
                this.activeState = state;
                isChange = true;
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
    trigger(event) {

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
    reset() {

        this.activeState = this.config.initial;
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
    undo() {

        if (this.stackStates.length !== 1) {

            this.stackStates.pop();
            this.changeState(this.stackStates.pop());
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

        if (this.stackStates.length !== 1) {

            this.stackStates.pop();
            this.changeState(this.stackStates.pop());
            return true;

        } else {

            return false;
        }
    }

    /**
     * Clears transition history
     */
    clearHistory() {}
}

const config = {
    initial: 'normal',
    states: {
        normal: {
            transitions: {
                study: 'busy',
            }
        },
        busy: {
            transitions: {
                get_tired: 'sleeping',
                get_hungry: 'hungry',
            }
        },
        hungry: {
            transitions: {
                eat: 'normal'
            },
        },
        sleeping: {
            transitions: {
                get_hungry: 'hungry',
                get_up: 'normal',
            },
        },
    }
};


const student = new FSM(config);

student.trigger('study');
console.log(student.stackStates);
student.undo();
console.log(student.undo());//.to.be.false;

module.exports = FSM;

/** @Created by Uladzimir Halushka **/

