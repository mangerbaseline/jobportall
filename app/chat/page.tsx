"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/lib/hook/useSocket";
import { useAppSelector } from "@/lib/hook/hook";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Briefcase,
  Paperclip,
  X,
  FileText,
  Download,
  Image as ImageIcon,
  Loader2,
  Search,
  FileArchive,
  FileSpreadsheet,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

interface Conversation {
  applicationId: string; // scopes the conversation
  userId: string;        // the other party's userId (Socket.IO room)
  userName: string;      // real name of the other party
  jobTitle: string;      // job title for display
  companyName?: string;
}

export default function ChatPage() {
  const socket = useSocket();
  const currentUser = useAppSelector((state) => state.user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [contacts, setContacts] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [contactsLoading, setContactsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // File attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Online status tracking
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Search filter state
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameToSearch = currentUser.role === "EMPLOYER" ? contact.userName : (contact.companyName || "");
    return (
      nameToSearch.toLowerCase().includes(query) ||
      contact.jobTitle.toLowerCase().includes(query)
    );
  });

  // Ref to track selectedUser inside socket listeners (avoids stale closures)
  const selectedUserRef = useRef<Conversation | null>(null);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Request browser notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Helper to show a browser notification
  const showNotification = useCallback((title: string, body: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }, []);

  // Fetch contacts (one per accepted application)
  useEffect(() => {
    if (currentUser.loading || !currentUser.id) return;

    const fetchContacts = async () => {
      setContactsLoading(true);
      try {
        const res = await fetch(`/api/chat/${currentUser.id}`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          const raw: {
            applicationId: string;
            userId: string;
            userName: string;
            jobTitle: string;
            companyName?: string;
          }[] = json.data ?? [];

          // Deduplicate by applicationId (each application = unique conversation)
          const unique = Array.from(
            new Map(raw.map((c) => [c.applicationId, c])).values()
          );
          setContacts(unique);
        }
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setContactsLoading(false);
      }
    };

    fetchContacts();
  }, [currentUser.id, currentUser.loading]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history when a conversation is selected
  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    setMessages([]);

    const fetchHistory = async () => {
      try {
        const tokenRes = await fetch("/api/auth/token");
        const { token } = await tokenRes.json();
        if (!token) return;

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
        // Use applicationId to fetch the correct conversation
        const res = await fetch(
          `${socketUrl}/api/conversations/${selectedUser.applicationId}`,
          { headers: { token } }
        );
        if (res.ok) setMessages(await res.json());
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedUser]);

  // Listen for incoming real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (msg: Message) => {
      const current = selectedUserRef.current;

      if (msg.senderId === current?.userId) {
        setMessages((prev) => [...prev, msg]);
      }

      // Show browser notification if tab is hidden or message is from a different conversation
      const isTabHidden = document.hidden;
      const isDifferentConversation = msg.senderId !== current?.userId;

      if (isTabHidden || isDifferentConversation) {
        // Find the sender's name from contacts
        const sender = contacts.find((c) => c.userId === msg.senderId);
        const senderName = sender?.userName || "New message";
        const body = msg.fileUrl
          ? `📎 ${msg.fileName || "Sent a file"}`
          : msg.content;
        showNotification(senderName, body);
      }
    });

    socket.on("messageSent", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageSent");
    };
  }, [socket, contacts, showNotification]);

  // Listen for online/offline status events
  useEffect(() => {
    if (!socket) return;

    socket.on("onlineUsers", (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on("userStatusChanged", ({ userId, status }: { userId: string; status: "online" | "offline" }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === "online") {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("userStatusChanged");
    };
  }, [socket]);

  // Clean up file preview URL on unmount or change
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate 10 MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10 MB");
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!socket || !selectedUser) return;
    if (!messageText.trim() && !selectedFile) return;

    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;

    // Upload file if attached
    if (selectedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || "Upload failed");
          setUploading(false);
          return;
        }

        const { data } = await res.json();
        fileUrl = data.fileUrl;
        fileName = data.fileName;
        fileType = data.fileType;
        toast.success("File uploaded successfully");
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Failed to upload file");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    socket.emit("sendMessage", {
      applicationId: selectedUser.applicationId,
      receiverId: selectedUser.userId,
      content: messageText || (fileName ? `Shared a file: ${fileName}` : ""),
      ...(fileUrl && { fileUrl }),
      ...(fileName && { fileName }),
      ...(fileType && { fileType }),
    });

    setMessageText("");
    clearFile();
  };

  const getMessageDateLabel = (dateStr: string) => {
    try {
      const messageDate = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (messageDate.toDateString() === today.toDateString()) {
        return "Today";
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return messageDate.toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }
    } catch (e) {
      return "";
    }
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  const getFileIcon = (fileName?: string, fileType?: string, className = "w-5 h-5") => {
    const ext = fileName?.split(".").pop()?.toLowerCase() || fileType?.split("/")[1]?.toLowerCase() || "";
    if (ext === "pdf") {
      return <FileText className={`${className} text-rose-500`} />;
    }
    if (["doc", "docx"].includes(ext)) {
      return <FileText className={`${className} text-blue-500`} />;
    }
    if (["xls", "xlsx", "csv"].includes(ext)) {
      return <FileSpreadsheet className={`${className} text-emerald-500`} />;
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
      return <FileArchive className={`${className} text-amber-500`} />;
    }
    return <FileText className={`${className} text-primary`} />;
  };

  const isImage = (type?: string) => type?.startsWith("image/");

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderMessageContent = (msg: Message) => {
    const isMine = msg.senderId === currentUser.id;

    // If the message has a file attachment
    if (msg.fileUrl) {
      if (isImage(msg.fileType)) {
        return (
          <div className="space-y-1.5">
            {/* Image Preview */}
            <div
              className="relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setLightboxUrl(msg.fileUrl!)}
            >
              <img
                src={msg.fileUrl}
                alt={msg.fileName || "Shared image"}
                className="max-w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                style={{ maxHeight: "280px" }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-xl" />
            </div>
            {/* Text content if any */}
            {msg.content && msg.content !== `Shared a file: ${msg.fileName}` && (
              <p className="text-sm mt-1">{msg.content}</p>
            )}
          </div>
        );
      }

      // Non-image file attachment card
      return (
        <div className="space-y-1.5">
          <a
            href={msg.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 hover:shadow-md ${isMine
                ? "border-white/20 bg-white/10 hover:bg-white/20"
                : "border-border bg-background hover:bg-accent"
              }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isMine ? "bg-white/20" : "bg-primary/10"
                }`}
            >
              {getFileIcon(msg.fileName, msg.fileType)}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium truncate ${isMine ? "text-white" : "text-foreground"
                  }`}
              >
                {msg.fileName || "File"}
              </p>
              <p
                className={`text-xs ${isMine ? "text-white/60" : "text-muted-foreground"
                  }`}
              >
                {msg.fileType?.split("/")[1]?.toUpperCase() || "FILE"}
              </p>
            </div>
            <Download
              className={`w-4 h-4 shrink-0 ${isMine ? "text-white/70" : "text-muted-foreground"
                }`}
            />
          </a>
          {/* Text content if any */}
          {msg.content && msg.content !== `Shared a file: ${msg.fileName}` && (
            <p className="text-sm mt-1">{msg.content}</p>
          )}
        </div>
      );
    }

    // Plain text message
    return <span>{msg.content}</span>;
  };

  return (
    <div className="flex h-screen pt-16 bg-background relative overflow-hidden">
      {/* ── Sidebar: Contact List ── */}
      <aside className={`border-r border-border bg-card flex-col transition-all duration-300 ease-in-out shrink-0
        ${selectedUser ? "hidden md:flex" : "flex"}
        w-full md:w-80 md:max-w-xs
      `}>
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
          </div>
        </div>
        {/* Search Input Bar */}
        <div className="p-3 border-b border-border bg-card">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-muted-foreground">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contactsLoading ? (
            <div className="p-3 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-4 text-center">
              <MessageCircle className="w-10 h-10 opacity-20" />
              <p className="text-sm">No accepted applications yet.</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-4 text-center">
              <Search className="w-10 h-10 opacity-20 mx-auto" />
              <p className="text-sm mt-1">No chats match your search.</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.applicationId}
                onClick={() => {
                  setSelectedUser(contact);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-accent ${selectedUser?.applicationId === contact.applicationId
                  ? "bg-primary/10 border-r-2 border-primary"
                  : ""
                  }`}
              >
                <div className="relative w-10 h-10 shrink-0">
                  <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-sm font-bold text-white">
                    {contact.userName.charAt(0).toUpperCase()}
                  </div>
                  {/* Online/Offline indicator dot */}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card transition-colors duration-300 ${onlineUsers.has(contact.userId)
                        ? "bg-emerald-500"
                        : "bg-gray-400"
                      }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentUser.role === "EMPLOYER" ? contact.userName : contact.companyName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Briefcase className="w-3 h-3 shrink-0" />
                    {contact.jobTitle}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat Window ── */}
      <main className={`flex-1 flex flex-col ${selectedUser ? "flex" : "hidden md:flex"}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-border bg-card">
              <button
                className="md:hidden p-1 -ml-1 text-foreground hover:text-primary transition-colors"
                onClick={() => setSelectedUser(null)}
                aria-label="Back to messages"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative w-9 h-9 shrink-0">
                <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-sm font-bold text-white">
                  {selectedUser.userName.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card transition-colors duration-300 ${onlineUsers.has(selectedUser.userId)
                      ? "bg-emerald-500"
                      : "bg-gray-400"
                    }`}
                />
              </div>
              <div >
                <p className="text-sm font-semibold text-foreground">
                  {selectedUser.userName}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {selectedUser.jobTitle} &middot;{" "}
                  {onlineUsers.has(selectedUser.userId)
                    ? "🟢 Online"
                    : "⚪ Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading messages...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <MessageCircle className="w-10 h-10 opacity-30" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                (() => {
                  let lastDateLabel = "";
                  return messages.map((msg, idx) => {
                    const isMine = msg.senderId === currentUser.id;
                    const currentDateLabel = getMessageDateLabel(msg.createdAt);
                    const showDivider = currentDateLabel !== lastDateLabel;
                    lastDateLabel = currentDateLabel;

                    return (
                      <div key={msg.id ?? idx} className="w-full space-y-3">
                        {showDivider && (
                          <div className="flex items-center justify-center my-6">
                            <div className="h-px bg-border flex-1" />
                            <span className="px-3 text-xs font-semibold text-muted-foreground bg-background rounded-full py-1 border border-border">
                              {currentDateLabel}
                            </span>
                            <div className="h-px bg-border flex-1" />
                          </div>
                        )}
                        <div
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] md:max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMine
                              ? "brand-gradient text-white rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                              }`}
                          >
                            {renderMessageContent(msg)}
                            <div
                              className={`text-[10px] mt-1 text-right select-none ${isMine ? "text-white/60" : "text-muted-foreground"
                                }`}
                            >
                              {formatMessageTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* File Preview Bar */}
            {selectedFile && (
              <div className="px-4 pt-3 pb-1 border-t border-border bg-card">
                <div className="flex items-center gap-3 bg-accent/50 rounded-xl px-3 py-2 border border-border">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getFileIcon(selectedFile.name, selectedFile.type, "w-6 h-6")}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    aria-label="Remove attachment"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-2 focus-within:border-primary transition-colors duration-200">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
                  onChange={handleFileSelect}
                />
                {/* Attachment button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 disabled:opacity-40"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </button>
                <input
                  type="text"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Message ${selectedUser.userName}...`}
                  disabled={uploading}
                />
                <button
                  onClick={handleSend}
                  disabled={(!messageText.trim() && !selectedFile) || uploading}
                  className="flex items-center justify-center w-8 h-8 rounded-lg brand-gradient text-white disabled:opacity-40 transition-opacity duration-200 hover:opacity-90"
                  aria-label="Send message"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
            <MessageCircle className="w-14 h-14 opacity-20" />
            <p className="text-base font-medium">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </main>

      {/* ── Image Lightbox ── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
