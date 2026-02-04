import Link from "next/link";

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-background-secondary py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Profile Header */}
                <div className="bg-background rounded-3xl border border-border overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-purple-600 to-cyan-600"></div>
                    <div className="px-8 pb-8">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 relative z-10">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white border-4 border-background">
                                U
                            </div>
                            <div className="flex-1 pb-2">
                                <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
                                <p className="text-foreground-muted">Customer Account</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="bg-background rounded-2xl border border-border p-6">
                    <h2 className="text-xl font-bold text-foreground mb-6">My Orders</h2>
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
                        <p className="text-foreground-muted mb-6">Start shopping to see your orders here</p>
                        <Link href="/" className="btn-primary">Explore Marketplace</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
