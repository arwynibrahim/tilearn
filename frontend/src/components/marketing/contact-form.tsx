'use client';

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CONTACT_EMAIL = 'contact@total-innovation.net';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const body = `${message}\n\n— ${name} (${email})`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject || 'Contact depuis le site TIL')}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-gray-700">
            Nom complet
          </label>
          <Input id="contact-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Adresse email
          </label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-gray-700">
          Sujet
        </label>
        <Input id="contact-subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <p className="text-xs text-gray-500">
        L&apos;envoi ouvre votre application email habituelle avec le message pré-rempli, à destination
        de {CONTACT_EMAIL}.
      </p>

      <Button type="submit" size="lg" className="gap-2">
        <Send className="size-4" aria-hidden="true" />
        Envoyer le message
      </Button>
    </form>
  );
}
