import AdminForm from '@/components/AdminForm/AdminForm';
import React from 'react';

const page = ({ params }: any) => {
      const { draftId } = params;

    return (
        <AdminForm draftId={draftId} />
    );
};

export default page;