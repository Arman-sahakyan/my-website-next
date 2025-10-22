import { RouteForm } from '@/components/RouteForm/RouteForm';
import React from 'react';

const page = ({ params }:any) => {
      const { draftId } = params;

    return (
       <RouteForm draftId={draftId} />
    );
};

export default page;