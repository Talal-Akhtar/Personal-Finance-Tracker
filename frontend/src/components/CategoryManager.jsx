// src/components/CategoryManager.jsx — Manage category settings

function CategoryManager({ categories }) {
  return (
    <div className="category-manager">
      <h3>Available Categories</h3>
      <div className="category-badges">
        {categories.length === 0 ? (
          <p className="empty-state">No categories available yet.</p>
        ) : (
          categories.map((category) => (
            <span key={category.id} className="category-badge">
              {category.name}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export default CategoryManager;
