import { RouteForm } from '@/components/RouteForm/RouteForm';
import React from 'react';

const page = ({ params }:any) => {
      const { draftId } = params;

    return (
      <main className='container'>
         <h1>Route Information</h1>
         <RouteForm draftId={draftId} />
      </main>
       
    );
};

export default page;