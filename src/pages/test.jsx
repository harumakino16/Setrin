import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import { useRouter } from 'next/router';

export default function Test() {


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">テストページ</h1>

    </div>
  );
}
