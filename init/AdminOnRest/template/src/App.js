import React from 'react';
import { Admin, Resource, Delete } from 'admin-on-rest';
import Dashboard from './Dashboard';
import vulcainRestClient from './vulcain/restClient'
import errorSagas from './vulcain/saga';

import PostIcon from 'material-ui/svg-icons/action/book';

//import {CustomerCreate, CustomerEdit, CustomerList} from 'service1.js'

const App = () => (
    <Admin dashboard={Dashboard} restClient={vulcainRestClient('http://localhost:8080/api')} customSagas={[errorSagas]}>
  /*  <Resource name="customer" list={aorCustomerList} edit={CustomerEdit} create={CustomerCreate} icon={UserIcon} remove={Delete} /> */
    </Admin>
);

export default App;
