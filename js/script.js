// =====================================================
// BlogSphere Module 5 Complete Script
// =====================================================

const API_BASE = "https://blog-application-in5o.onrender.com/api";

// Helper for page path resolution
const isInPagesDir = window.location.pathname.includes("/pages/");
const getPagePath = (page) => isInPagesDir ? page : `pages/${page}`;
const getHomePath = () => isInPagesDir ? "../index.html" : "index.html";

// Token & User Storage Helpers
const getToken = () => localStorage.getItem("token");
const setToken = (token) => localStorage.setItem("token", token);
const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
        return null;
    }
};
const setUser = (user) => localStorage.setItem("user", JSON.stringify(user));
const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

// Date Formatting Helper
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
};

// Sparkle Background (Preserved from Module 2)
const initSparkleBackground = () => {
    const sparkleCount = 35;
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement("span");
        sparkle.classList.add("sparkle");
        sparkle.style.left = Math.random() * 100 + "vw";
        sparkle.style.top = Math.random() * 100 + "vh";
        sparkle.style.animationDelay = Math.random() * 3 + "s";
        sparkle.style.animationDuration = 2 + Math.random() * 3 + "s";
        document.body.appendChild(sparkle);
    }
};

// Update Navbar Links Dynamically
const updateNavbar = () => {
    const navLinks = document.getElementById("navLinks");
    if (!navLinks) return;

    const token = getToken();
    const user = getUser();

    if (token) {
        navLinks.innerHTML = `
            <a href="${getHomePath()}">Home</a>
            <a href="${getPagePath("dashboard.html")}">Dashboard</a>
            <a href="${getPagePath("create-blog.html")}">Create Blog</a>
            <a href="#" id="logoutBtn" style="color: #fca5a5;">Logout (${escapeHtml(user?.name || "User")})</a>
        `;

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                clearAuth();
                alert("You have logged out successfully.");
                window.location.href = getPagePath("login.html");
            });
        }

        const heroStartBtn = document.getElementById("heroStartWritingBtn");
        if (heroStartBtn) {
            heroStartBtn.href = getPagePath("create-blog.html");
        }
    } else {
        navLinks.innerHTML = `
            <a href="${getHomePath()}">Home</a>
            <a href="${getPagePath("login.html")}">Login</a>
            <a href="${getPagePath("register.html")}">Register</a>
        `;
    }
};

// =====================================================
// AUTH HANDLERS (Login & Register)
// =====================================================

const initAuthForms = () => {
    // Login Form Handler
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email")?.value.trim();
            const password = document.getElementById("password")?.value;

            if (!email || !password) {
                alert("Please enter both email and password.");
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Login failed.");
                    return;
                }

                setToken(data.token);
                setUser(data.user);
                alert("Login successful!");
                window.location.href = getPagePath("dashboard.html");
            } catch (err) {
                console.error("Login error:", err);
                alert("Server error connecting to backend API.");
            }
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name")?.value.trim();
            const email = document.getElementById("registerEmail")?.value.trim();
            const password = document.getElementById("registerPassword")?.value;
            const confirmPassword = document.getElementById("confirmPassword")?.value;

            if (!name || !email || !password) {
                alert("All required fields must be filled.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Registration failed.");
                    return;
                }

                alert("Registration successful! Please login to continue.");
                window.location.href = getPagePath("login.html");
            } catch (err) {
                console.error("Register error:", err);
                alert("Server error connecting to backend API.");
            }
        });
    }
};

// =====================================================
// HOME PAGE BLOG LISTING & SEARCH / FILTER
// =====================================================

const initHomePage = () => {
    const homeBlogContainer = document.getElementById("homeBlogContainer");
    if (!homeBlogContainer) return;

    let currentSearch = "";
    let currentCategory = "All";

    const fetchAndRenderBlogs = async () => {
        homeBlogContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: #aab6cc;">Loading blogs...</p>';

        try {
            let url = `${API_BASE}/blogs?`;
            if (currentSearch) {
                url += `search=${encodeURIComponent(currentSearch)}&`;
            }
            if (currentCategory && currentCategory !== "All") {
                url += `category=${encodeURIComponent(currentCategory)}&`;
            }

            const res = await fetch(url);
            const blogs = await res.json();

            if (!res.ok) {
                homeBlogContainer.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: #fca5a5;">${blogs.message || "Error loading blogs."}</p>`;
                return;
            }

            if (!blogs || blogs.length === 0) {
                homeBlogContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: #aab6cc; padding: 40px;">No blogs found matching your criteria.</p>';
                return;
            }

            homeBlogContainer.innerHTML = blogs.map(blog => {
                const authorName = blog.author ? (blog.author.name || "Anonymous") : "Unknown Author";
                const pubDate = formatDate(blog.createdAt);
                const snippet = blog.content ? (blog.content.length > 120 ? blog.content.substring(0, 120) + "..." : blog.content) : "";
                const blogDetailUrl = `${getPagePath("blog-details.html")}?id=${blog._id}`;

                return `
                    <article class="blog-card">
                        <span class="category">${blog.category || "General"}</span>
                        <h3>${escapeHtml(blog.title)}</h3>
                        <p>${escapeHtml(snippet)}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                            <small style="color: #7f8ba3;">By ${escapeHtml(authorName)} • ${pubDate}</small>
                            <a href="${blogDetailUrl}" class="read-more">Read More →</a>
                        </div>
                    </article>
                `;
            }).join("");

        } catch (err) {
            console.error("Fetch blogs error:", err);
            homeBlogContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: #fca5a5;">Failed to load blogs from backend API.</p>';
        }
    };

    // Search input listener with debounce
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearch = e.target.value.trim();
                fetchAndRenderBlogs();
            }, 300);
        });
    }

    // Category filter buttons
    const categoryFilters = document.getElementById("categoryFilters");
    if (categoryFilters) {
        categoryFilters.addEventListener("click", (e) => {
            if (e.target.classList.contains("filter-btn")) {
                document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
                e.target.classList.add("active");
                currentCategory = e.target.getAttribute("data-category") || "All";
                fetchAndRenderBlogs();
            }
        });
    }

    fetchAndRenderBlogs();
};

// =====================================================
// DASHBOARD PAGE (Protected Private Route & Profile)
// =====================================================

const initDashboardPage = () => {
    const dashboardBlogContainer = document.getElementById("dashboardBlogContainer");
    if (!dashboardBlogContainer) return;

    // Authentication Guard
    const token = getToken();
    if (!token) {
        alert("Authentication required. Please log in to access your dashboard.");
        window.location.href = getPagePath("login.html");
        return;
    }

    // Fetch user profile and user-specific blogs
    const loadDashboardData = async () => {
        try {
            // 1. User Profile API
            const profileRes = await fetch(`${API_BASE}/auth/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (profileRes.status === 401) {
                clearAuth();
                alert("Session expired or invalid token. Please log in again.");
                window.location.href = getPagePath("login.html");
                return;
            }

            if (profileRes.ok) {
                const userProfile = await profileRes.json();
                setUser(userProfile);
                const welcomeLabel = document.getElementById("welcomeUserLabel");
                if (welcomeLabel) welcomeLabel.textContent = `Welcome back, ${userProfile.name || ""}`;
                const profileDesc = document.getElementById("userProfileInfo");
                if (profileDesc) profileDesc.textContent = `Email: ${userProfile.email || ""} | Role: ${userProfile.role || "User"} | Status: Active`;
                const roleEl = document.getElementById("statUserRole");
                if (roleEl) roleEl.textContent = userProfile.role || "User";
            }

            // 2. User-Specific Blogs API (GET /api/blogs/my)
            const blogsRes = await fetch(`${API_BASE}/blogs/my`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (blogsRes.status === 401) {
                clearAuth();
                alert("Session expired or invalid token. Please log in again.");
                window.location.href = getPagePath("login.html");
                return;
            }

            const blogs = await blogsRes.json();

            if (!blogsRes.ok) {
                dashboardBlogContainer.innerHTML = `<p style="color: #fca5a5;">${blogs.message || "Error loading your blogs."}</p>`;
                return;
            }

            const totalCountEl = document.getElementById("statTotalBlogs");
            if (totalCountEl) totalCountEl.textContent = blogs.length;

            if (blogs.length === 0) {
                dashboardBlogContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: rgba(30, 41, 69, 0.5); border-radius: 12px;">
                        <p style="color: #aab6cc; margin-bottom: 15px;">You haven't published any blogs yet.</p>
                        <a href="${getPagePath("create-blog.html")}" class="btn">+ Create Your First Blog</a>
                    </div>
                `;
                return;
            }

            dashboardBlogContainer.innerHTML = blogs.map(blog => {
                const pubDate = formatDate(blog.createdAt);
                const snippet = blog.content ? (blog.content.length > 100 ? blog.content.substring(0, 100) + "..." : blog.content) : "";
                const editUrl = `${getPagePath("create-blog.html")}?id=${blog._id}`;
                const detailUrl = `${getPagePath("blog-details.html")}?id=${blog._id}`;

                return `
                    <article class="dashboard-blog-card">
                        <div class="dashboard-blog-content">
                            <span class="category">${blog.category || "General"}</span>
                            <h3><a href="${detailUrl}" style="text-decoration: none; color: inherit;">${escapeHtml(blog.title)}</a></h3>
                            <p>${escapeHtml(snippet)}</p>
                            <small>Published on ${pubDate}</small>
                        </div>
                        <div class="blog-actions">
                            <a href="${editUrl}">Edit</a>
                            <button class="delete-btn" data-id="${blog._id}">Delete</button>
                        </div>
                    </article>
                `;
            }).join("");

            // Add delete event listeners
            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    const blogId = e.target.getAttribute("data-id");
                    if (!blogId) return;

                    if (confirm("Are you sure you want to delete this blog?")) {
                        try {
                            const delRes = await fetch(`${API_BASE}/blogs/${blogId}`, {
                                method: "DELETE",
                                headers: { "Authorization": `Bearer ${token}` }
                            });

                            if (delRes.status === 401) {
                                clearAuth();
                                alert("Session expired. Please log in again.");
                                window.location.href = getPagePath("login.html");
                                return;
                            }

                            const delData = await delRes.json();

                            if (delRes.ok) {
                                alert(delData.message || "Blog deleted successfully!");
                                loadDashboardData();
                            } else {
                                alert(delData.message || "Failed to delete blog.");
                            }
                        } catch (err) {
                            console.error("Delete error:", err);
                            alert("Server error deleting blog.");
                        }
                    }
                });
            });

        } catch (err) {
            console.error("Dashboard error:", err);
            dashboardBlogContainer.innerHTML = '<p style="color: #fca5a5;">Server error loading dashboard.</p>';
        }
    };

    loadDashboardData();
};

// =====================================================
// CREATE & EDIT BLOG PAGE
// =====================================================

const initCreateBlogPage = () => {
    const createBlogForm = document.getElementById("createBlogForm");
    if (!createBlogForm) return;

    // Authentication Guard
    const token = getToken();
    if (!token) {
        alert("Authentication required. Please log in to create or edit blogs.");
        window.location.href = getPagePath("login.html");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get("id");
    const isEditMode = Boolean(blogId);

    if (isEditMode) {
        const pageTitle = document.getElementById("createBlogPageTitle");
        if (pageTitle) pageTitle.textContent = "Edit Blog";
        const subHeader = document.getElementById("formSubHeader");
        if (subHeader) subHeader.textContent = "Update Story";
        const publishBtn = document.getElementById("publishBtn");
        if (publishBtn) publishBtn.textContent = "Update Blog";

        // Fetch existing blog data
        fetch(`${API_BASE}/blogs/${blogId}`)
            .then(res => res.json())
            .then(blog => {
                if (blog && blog.title) {
                    document.getElementById("blogTitle").value = blog.title || "";
                    document.getElementById("category").value = blog.category || "";
                    document.getElementById("content").value = blog.content || "";
                    document.getElementById("tags").value = Array.isArray(blog.tags) ? blog.tags.join(", ") : (blog.tags || "");
                }
            })
            .catch(err => console.error("Error loading blog for edit:", err));
    }

    createBlogForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("blogTitle")?.value.trim();
        const category = document.getElementById("category")?.value;
        const content = document.getElementById("content")?.value.trim();
        const tags = document.getElementById("tags")?.value.trim();

        if (!title || !category || !content) {
            alert("Title, category, and content are required.");
            return;
        }

        const endpoint = isEditMode ? `${API_BASE}/blogs/${blogId}` : `${API_BASE}/blogs`;
        const method = isEditMode ? "PUT" : "POST";

        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, category, content, tags })
            });

            if (res.status === 401) {
                clearAuth();
                alert("Session expired. Please log in again.");
                window.location.href = getPagePath("login.html");
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to save blog.");
                return;
            }

            alert(isEditMode ? "Blog updated successfully!" : "Blog published successfully!");
            window.location.href = getPagePath("dashboard.html");

        } catch (err) {
            console.error("Save blog error:", err);
            alert("Server error saving blog.");
        }
    });
};

// =====================================================
// BLOG DETAILS PAGE
// =====================================================

const initBlogDetailsPage = () => {
    const blogDetailsContainer = document.getElementById("blogDetailsContainer");
    if (!blogDetailsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get("id");

    if (!blogId) {
        blogDetailsContainer.innerHTML = '<p style="text-align: center; color: #fca5a5; padding: 40px;">No blog ID provided in URL.</p>';
        return;
    }

    fetch(`${API_BASE}/blogs/${blogId}`)
        .then(async (res) => {
            const blog = await res.json();
            if (!res.ok) {
                blogDetailsContainer.innerHTML = `<p style="text-align: center; color: #fca5a5; padding: 40px;">${blog.message || "Blog not found."}</p>`;
                return;
            }

            const currentUser = getUser();
            const authorId = blog.author ? (blog.author._id || blog.author.id || blog.author) : null;
            const currentUserId = currentUser ? (currentUser.id || currentUser._id) : null;
            const isAuthor = Boolean(currentUserId && authorId && currentUserId.toString() === authorId.toString());

            const authorName = blog.author ? (blog.author.name || "Anonymous") : "Unknown Author";
            const pubDate = formatDate(blog.createdAt);
            const tagsList = Array.isArray(blog.tags) ? blog.tags : [];

            blogDetailsContainer.innerHTML = `
                <article class="blog-details-card">
                    <div class="blog-details-meta">
                        <span class="category">${escapeHtml(blog.category || "General")}</span>
                        <span style="color: #7f8ba3;">• ${pubDate}</span>
                    </div>

                    <h1 class="blog-details-title">${escapeHtml(blog.title)}</h1>

                    <div class="blog-author-info">
                        <span>✍️ Authored by <strong>${escapeHtml(authorName)}</strong></span>
                    </div>

                    <div class="blog-body-content">${escapeHtml(blog.content)}</div>

                    ${tagsList.length > 0 ? `
                        <div class="blog-tags-container">
                            ${tagsList.map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join("")}
                        </div>
                    ` : ""}

                    ${isAuthor ? `
                        <div class="blog-detail-actions">
                            <a href="${getPagePath("create-blog.html")}?id=${blog._id}" class="edit-action-btn">✏️ Edit Blog</a>
                            <button id="deleteDetailBtn" class="delete-action-btn">🗑️ Delete Blog</button>
                        </div>
                    ` : ""}
                </article>
            `;

            if (isAuthor) {
                const delBtn = document.getElementById("deleteDetailBtn");
                if (delBtn) {
                    delBtn.addEventListener("click", async () => {
                        if (confirm("Are you sure you want to delete this blog?")) {
                            try {
                                const delRes = await fetch(`${API_BASE}/blogs/${blog._id}`, {
                                    method: "DELETE",
                                    headers: { "Authorization": `Bearer ${getToken()}` }
                                });

                                if (delRes.status === 401) {
                                    clearAuth();
                                    alert("Session expired. Please log in again.");
                                    window.location.href = getPagePath("login.html");
                                    return;
                                }

                                const delData = await delRes.json();
                                if (delRes.ok) {
                                    alert("Blog deleted successfully!");
                                    window.location.href = getPagePath("dashboard.html");
                                } else {
                                    alert(delData.message || "Failed to delete blog.");
                                }
                            } catch (err) {
                                console.error("Delete error:", err);
                                alert("Server error deleting blog.");
                            }
                        }
                    });
                }
            }
        })
        .catch(err => {
            console.error("Fetch blog details error:", err);
            blogDetailsContainer.innerHTML = '<p style="text-align: center; color: #fca5a5; padding: 40px;">Server error fetching blog details.</p>';
        });
};

// HTML Escaper for XSS Prevention
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Global DOM Content Loaded Listener
document.addEventListener("DOMContentLoaded", () => {
    initSparkleBackground();
    updateNavbar();
    initAuthForms();
    initHomePage();
    initDashboardPage();
    initCreateBlogPage();
    initBlogDetailsPage();
});

console.log("BlogSphere Module 5 loaded successfully!");