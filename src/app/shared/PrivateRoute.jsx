import React from 'react';
import { Route, Redirect } from 'react-router-dom';

// TODO: Let's use this HOC for protect our auth routes
export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        localStorage.getItem('authUser')
            ? <Component {...props} />
            : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />
)
