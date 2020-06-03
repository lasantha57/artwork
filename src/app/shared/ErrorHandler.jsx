import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';

// ErrorHandler is still a class-based component since there is no hook for componentDidCatch lifecycle event
class ErrorHandler extends Component {

    constructor(props) {
        super(props);
        this.state = { errorOccurred: false }
    }

    componentDidCatch(error, info) {
        this.setState({ errorOccurred: true });
        // let's log errors internaly/externally
        console.log(error, info);
    }

    render() {
        return this.state.errorOccurred ? <Fragment>
            <div className="col-md-12 text-center">
                <p>Page not found, goto <Link to="/" className="btn btn-link">Home</Link></p>
            </div>
        </Fragment> : this.props.children;
    }
}

export default ErrorHandler;
