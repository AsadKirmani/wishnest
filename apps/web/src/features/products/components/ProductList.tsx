
import type { SavedCollectionProduct } from "../types";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: SavedCollectionProduct[];
  loading: boolean;
  busy: boolean;
  onRemove: (productId: string) => void;
}

export default function ProductList({
  products,
  loading,
  busy,
  onRemove,
}: ProductListProps) {
  if (loading) {
    return <p>Loading products...</p>;
  }

  if (products.length === 0) {
    return (
      <div className="products-empty">
        <h3>No products saved yet</h3>
        <p>Add a product URL to start building your wishlist.</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      {products.map((item) => (
        <ProductCard
          key={`${item.item.collection_id}-${item.product.id}`}
          item={item}
          busy={busy}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
