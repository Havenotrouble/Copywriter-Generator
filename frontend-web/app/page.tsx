'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Copy, Check, Sparkles } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';
import { cn } from '../lib/utils';

// Platform configuration
const PLATFORMS = [
  { id: 'AMAZON', name: 'Amazon', color: 'bg-orange-400' },
  { id: 'TIKTOK_SHOP', name: 'TikTok Shop', color: 'bg-pink-500' },
  { id: 'SHOPEE', name: 'Shopee', color: 'bg-red-500' },
  { id: 'ALIEXPRESS', name: 'AliExpress', color: 'bg-red-600' },
  { id: 'TEMU', name: 'Temu', color: 'bg-yellow-500' },
  { id: 'WALMART', name: 'Walmart', color: 'bg-blue-500' },
  { id: 'EBAY', name: 'eBay', color: 'bg-blue-600' },
  { id: 'LAZADA', name: 'Lazada', color: 'bg-purple-500' },
  { id: 'ETSY', name: 'Etsy', color: 'bg-orange-600' },
  { id: 'MERCARI', name: 'Mercari', color: 'bg-red-700' },
];

interface PlatformResult {
  content: string;
  isGenerating: boolean;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['AMAZON', 'TEMU', 'WALMART']);
  const [language, setLanguage] = useState('English');
  const [results, setResults] = useState<Record<string, PlatformResult>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('AMAZON');
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [serverConnected, setServerConnected] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check server connection
    fetch('/api/health')
      .then(() => setServerConnected(true))
      .catch(() => setServerConnected(false));
  }, []);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = async () => {
    if (!input.trim() || selectedPlatforms.length === 0) return;

    setIsGenerating(true);

    // 初始化结果状态
    const initialResults: Record<string, PlatformResult> = {};
    selectedPlatforms.forEach((platform) => {
      initialResults[platform] = { content: '', isGenerating: true };
    });
    setResults(initialResults);
    setActiveTab(selectedPlatforms[0]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: input,
          platforms: selectedPlatforms,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      // 创建 ReadableStream reader
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      // TextDecoder 用于将 Uint8Array 转换为字符串
      const decoder = new TextDecoder('utf-8');

      // 缓冲区：处理"粘包"问题（不完整的数据行）
      let buffer = '';

      // 循环读取流式数据
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('Stream completed');
          break;
        }

        // 解码二进制数据，使用 stream: true 处理分片的 UTF-8 字符
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // SSE 格式：每条消息以 \n\n 结尾
        // 处理缓冲区中的完整消息
        const messages = buffer.split('\n\n');

        // 最后一个元素可能是不完整的，保留在缓冲区
        buffer = messages.pop() || '';

        // 处理每条完整的 SSE 消息
        for (const message of messages) {
          if (!message.trim()) continue;

          // SSE 格式：data: {...}
          const lines = message.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonStr = line.substring(5).trim();

              if (jsonStr) {
                try {
                  // 解析 JSON 数据
                  const data = JSON.parse(jsonStr);

                  // 实时更新状态：追加文本到对应平台
                  setResults((prev) => {
                    const platformData = prev[data.id];
                    return {
                      ...prev,
                      [data.id]: {
                        content: (platformData?.content || '') + data.text,
                        isGenerating: true,
                      },
                    };
                  });
                } catch (e) {
                  console.error('Failed to parse JSON:', jsonStr, e);
                }
              }
            }
          }
        }
      }

      // 处理剩余的缓冲区数据
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.substring(5).trim();
            if (jsonStr) {
              try {
                const data = JSON.parse(jsonStr);
                setResults((prev) => ({
                  ...prev,
                  [data.id]: {
                    content: (prev[data.id]?.content || '') + data.text,
                    isGenerating: true,
                  },
                }));
              } catch (e) {
                console.error('Failed to parse remaining JSON:', jsonStr, e);
              }
            }
          }
        }
      }

      // 标记所有平台为完成状态
      setResults((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = { ...updated[key], isGenerating: false };
        });
        return updated;
      });
    } catch (error) {
      console.error('Error generating content:', error);
      alert('生成失败，请重试');

      // 错误时也要标记为完成
      setResults((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = { ...updated[key], isGenerating: false };
        });
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (platformId: string) => {
    const content = results[platformId]?.content;
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopiedPlatform(platformId);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderMarkdown = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: JSX.Element[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('###')) {
        elements.push(
          <motion.h3
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold mt-4 mb-2 text-orange-400"
          >
            {line.substring(3).trim()}
          </motion.h3>
        );
      } else if (line.startsWith('##')) {
        elements.push(
          <motion.h2
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold mt-6 mb-3 text-orange-500"
          >
            {line.substring(2).trim()}
          </motion.h2>
        );
      } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        elements.push(
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-6 list-disc text-gray-300"
          >
            {renderInlineMarkdown(line.trim().substring(1).trim())}
          </motion.li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-2 text-gray-200 animate-typewriter"
          >
            {renderInlineMarkdown(line)}
          </motion.p>
        );
      }
    }

    return <div className="space-y-1 font-mono">{elements}</div>;
  };

  const renderInlineMarkdown = (text: string) => {
    const parts: JSX.Element[] = [];
    let currentIndex = 0;
    let key = 0;

    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;

    const segments: Array<{ type: 'bold' | 'text'; content: string; start: number; end: number }> = [];

    while ((match = boldRegex.exec(text)) !== null) {
      segments.push({ type: 'bold', content: match[1], start: match.index, end: match.index + match[0].length });
    }

    segments.sort((a, b) => a.start - b.start);

    for (const segment of segments) {
      if (currentIndex < segment.start) {
        parts.push(<span key={key++}>{text.substring(currentIndex, segment.start)}</span>);
      }
      parts.push(
        <strong key={key++} className="font-bold text-orange-400">
          {segment.content}
        </strong>
      );
      currentIndex = segment.end;
    }

    if (currentIndex < text.length) {
      parts.push(<span key={key++}>{text.substring(currentIndex)}</span>);
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-navy-500 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-orange-500" />
            AI BorderlessCopy
            {serverConnected && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm">DeepSeek V3 驱动 • 实时流式生成</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <div className="bg-navy-700/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-navy-600">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                商品描述
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="例如：智能蓝牙耳机，降噪，运动型"
                className="w-full h-32 p-3 bg-navy-800 border border-navy-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-200 placeholder-gray-500"
              />

              {/* Language Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  目标语言
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 bg-navy-800 border border-navy-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-200"
                >
                  <option value="English">English</option>
                  <option value="Chinese">中文</option>
                  <option value="Spanish">Español</option>
                  <option value="French">Français</option>
                </select>
              </div>

              {/* Platform Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  选择平台
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((platform, index) => (
                    <motion.button
                      key={platform.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => togglePlatform(platform.id)}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-sm font-medium',
                        selectedPlatforms.includes(platform.id)
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-navy-800 text-gray-300 border-navy-600 hover:border-orange-500/50'
                      )}
                    >
                      {platform.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isGenerating || !input.trim() || selectedPlatforms.length === 0}
                className={cn(
                  'mt-6 w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
                  isGenerating || !input.trim() || selectedPlatforms.length === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '生成文案'
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Right Panel - Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7"
          >
            {Object.keys(results).length > 0 ? (
              <div className="bg-navy-700/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-navy-600">
                <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                  <Tabs.List className="flex flex-wrap gap-2 border-b border-navy-600 pb-4 mb-4">
                    {selectedPlatforms.map((platformId, index) => {
                      const platform = PLATFORMS.find((p) => p.id === platformId);
                      const result = results[platformId];
                      return (
                        <Tabs.Trigger
                          key={platformId}
                          value={platformId}
                          asChild
                        >
                          <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                              'relative px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2',
                              activeTab === platformId
                                ? 'text-orange-500'
                                : 'text-gray-400 hover:text-gray-200'
                            )}
                          >
                            {platform?.name}
                            {result?.isGenerating && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                              </span>
                            )}
                            {activeTab === platformId && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                                initial={false}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30
                                }}
                              />
                            )}
                          </motion.button>
                        </Tabs.Trigger>
                      );
                    })}
                  </Tabs.List>

                  <AnimatePresence mode="wait">
                    {selectedPlatforms.map((platformId) => (
                      <Tabs.Content key={platformId} value={platformId} asChild>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="relative"
                        >
                          {/* Copy Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(platformId)}
                            disabled={!results[platformId]?.content}
                            className={cn(
                              'absolute top-0 right-0 flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                              copiedPlatform === platformId
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-navy-800 hover:bg-navy-700 text-gray-300',
                              !results[platformId]?.content && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            {copiedPlatform === platformId ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="text-sm">已复制</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span className="text-sm">复制文案</span>
                              </>
                            )}
                          </motion.button>

                          {/* Content */}
                          <div className="pr-32 mt-12 min-h-[300px]">
                            {results[platformId]?.content ? (
                              renderMarkdown(results[platformId].content)
                            ) : (
                              <p className="text-gray-500 italic flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                生成中...
                              </p>
                            )}
                          </div>
                        </motion.div>
                      </Tabs.Content>
                    ))}
                  </AnimatePresence>
                </Tabs.Root>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-navy-700/30 backdrop-blur-sm rounded-xl shadow-xl p-12 border border-navy-600 border-dashed flex items-center justify-center min-h-[400px]"
              >
                <div className="text-center text-gray-500">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">输入商品描述并点击生成</p>
                  <p className="text-sm mt-2">AI 将为您生成多平台优化文案</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
