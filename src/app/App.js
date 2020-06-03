import React, { Suspense } from 'react';
import { Router, Switch, Route } from 'react-router-dom';

import history from './util/history';
import ErrorHandler from './shared/ErrorHandler';

import './App.scss';

import PageHeader from './shared/PageHeader';
import PageFooter from './shared/PageFooter';

import Home from './pages/Home';

const App = () => {

    const renderRoutes = () => {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <Switch>
                    <Route exact path="/" component={Home} />
                </Switch>
            </Suspense >
        )
    }

    return (
        <div>
            <Router history={history}>
                <PageHeader></PageHeader>
                <ErrorHandler>{renderRoutes()}</ErrorHandler>
                <PageFooter></PageFooter>
            </Router>
        </div>
    );
}

export default App;
