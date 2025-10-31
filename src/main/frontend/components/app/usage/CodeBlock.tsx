import {useState} from 'react';
import {Icon} from '@vaadin/react-components/Icon';
import '@vaadin/icons';

interface CodeBlockProps {
    code: string;
    language?: 'javascript' | 'typescript' | 'bash' | 'json' | 'text';
    title?: string;
    showLineNumbers?: boolean;
}

export function CodeBlock({code, language = 'text', title, showLineNumbers = false}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getLanguageColor = () => {
        switch (language) {
            case 'javascript':
            case 'typescript':
                return 'bg-yellow-500';
            case 'bash':
                return 'bg-green-500';
            case 'json':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {(title || language) && (
                <div
                    className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        {title && (
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {title}
                            </span>
                        )}
                        {language && language !== 'text' && (
                            <span className={`text-xs px-2 py-0.5 rounded text-white ${getLanguageColor()}`}>
                                {language}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        {copied ? (
                            <>
                                <Icon icon="vaadin:check" className="w-3.5 h-3.5 text-green-600 dark:text-green-400"/>
                                <span className="text-green-600 dark:text-green-400">Copié !</span>
                            </>
                        ) : (
                            <>
                                <Icon icon="vaadin:copy" className="w-3.5 h-3.5"/>
                                <span>Copier</span>
                            </>
                        )}
                    </button>
                </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    {showLineNumbers ? (
                        <code>
                            {code.split('\n').map((line, index) => (
                                <div key={index} className="table-row">
                                    <span
                                        className="table-cell pr-4 text-right select-none text-gray-400 dark:text-gray-600">
                                        {index + 1}
                                    </span>
                                    <span className="table-cell">{line}</span>
                                </div>
                            ))}
                        </code>
                    ) : (
                        <code>{code}</code>
                    )}
                </pre>
            </div>
        </div>
    );
}
