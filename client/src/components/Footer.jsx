import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Instagram } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useState } from 'react';

const NAV_COLUMNS = [
    {
        heading: 'Product',
        links: [
            { label: 'Browse Mentors', to: '/mentors' },
            { label: 'Pricing', to: '/pricing' },
            { label: 'How It Works', to: '/how-it-works' },
        ],
    },
    {
        heading: 'Company',
        links: [
            { label: 'About', to: '/about' },
            { label: 'Blog', to: '/blog', muted: true },
            { label: 'Careers', to: '/careers', muted: true },
        ],
    },
    {
        heading: 'Support',
        links: [
            { label: 'FAQ', to: '/faq', muted: true },
            { label: 'Contact', to: '/contact', muted: true },
            { label: 'Feedback', feedback: true },
        ],
    },
    {
        heading: 'Legal',
        links: [
            { label: 'Privacy Policy', to: '/privacy', muted: true },
            { label: 'Terms of Service', to: '/terms', muted: true },
        ],
    },
];

const SOCIAL = [
    { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter / X' },
    { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
];

export default function Footer() {
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    return (
        <>
            <footer className="bg-slate-900 text-slate-400">
                {/* Main grid */}
                <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4">
                        {NAV_COLUMNS.map(({ heading, links }) => (
                            <div key={heading}>
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
                                    {heading}
                                </h4>
                                <ul className="space-y-3">
                                    {links.map((link) => {
                                        const cls =
                                            'text-sm transition-colors duration-200 cursor-pointer ' +
                                            (link.muted
                                                ? 'text-slate-500 hover:text-slate-300'
                                                : 'text-slate-400 hover:text-white');

                                        if (link.feedback) {
                                            return (
                                                <li key={link.label}>
                                                    <button
                                                        onClick={() => setFeedbackOpen(true)}
                                                        className={cls}
                                                    >
                                                        {link.label}
                                                    </button>
                                                </li>
                                            );
                                        }

                                        return (
                                            <li key={link.label}>
                                                <Link to={link.to} className={cls}>
                                                    {link.label}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Wordmark + copyright */}
                        <div className="flex items-center gap-3">
                            <span className="text-white text-lg font-bold tracking-tight">
                                Bridge
                            </span>
                            <span className="text-slate-600 text-sm hidden sm:inline">|</span>
                            <span className="text-slate-500 text-sm">
                                © 2025 Bridge. All rights reserved.
                            </span>
                        </div>

                        {/* Social icons */}
                        <div className="flex items-center gap-4">
                            {SOCIAL.map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="text-slate-500 hover:text-white transition-colors duration-200 cursor-pointer"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
        </>
    );
}
