import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/Home'
import { ProductDetailPage } from '@/pages/ProductDetail'
import { ProductListPage } from '@/pages/ProductList'
import { PublishProductPage } from '@/pages/PublishProduct'
import { EditProductPage } from '@/pages/EditProduct'
import { MyProductsPage } from '@/pages/MyProducts'
import { MyOrdersPage } from '@/pages/MyOrders'
import { MySoldOrdersPage } from '@/pages/MySoldOrders'
import { OrderDetailPage } from '@/pages/OrderDetail'
import { UserProfilePage } from '@/pages/UserProfile'
import { FavoritesPage } from '@/pages/Favorites'
import { ProfilePage } from '@/pages/Profile'
import { RegisterPage } from '@/pages/Register'
import { FeedbackPage } from '@/pages/Feedback'

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  if (!user) {
    sessionStorage.setItem('openLoginModal', 'login')
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// 已登录用户路由保护组件（不再区分买家卖家）
const SellerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  if (!user) {
    sessionStorage.setItem('openLoginModal', 'login')
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export const AppRouter = () => {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/register" element={<RegisterPage />} />

      {/* 需要布局的路由 */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/products"
        element={
          <Layout>
            <ProductListPage />
          </Layout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <Layout>
            <ProductDetailPage />
          </Layout>
        }
      />

      {/* 需要登录的路由 */}
      <Route
        path="/publish"
        element={
          <SellerRoute>
            <Layout>
              <PublishProductPage />
            </Layout>
          </SellerRoute>
        }
      />
      <Route
        path="/products/:id/edit"
        element={
          <SellerRoute>
            <Layout>
              <EditProductPage />
            </Layout>
          </SellerRoute>
        }
      />
      <Route
        path="/my-products"
        element={
          <SellerRoute>
            <Layout>
              <MyProductsPage />
            </Layout>
          </SellerRoute>
        }
      />
      <Route
        path="/my-orders"
        element={
          <ProtectedRoute>
            <Layout>
              <MyOrdersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-sold-orders"
        element={
          <ProtectedRoute>
            <Layout>
              <MySoldOrdersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <OrderDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:userId/profile"
        element={
          <Layout>
            <UserProfilePage />
          </Layout>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Layout>
              <FavoritesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <Layout>
            <FeedbackPage />
          </Layout>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
