exports.getDashboardStats = async (req, res) => {
    try {
        const { developerId } = req.query;
        
        // Mock data aggregation since we are using separate databases per service in microservices.
        // In a real scenario, this service would either have read-only replica access to other DBs,
        // or it would use gRPC/REST to fetch counts from other services, or consume Kafka events.
        
        const mockStats = {
            totalProjects: Math.floor(Math.random() * 10) + 1,
            activeSubscriptions: Math.floor(Math.random() * 5000) + 100,
            revenueThisMonth: Math.floor(Math.random() * 100000) + 5000,
            smsSentToday: Math.floor(Math.random() * 20000) + 500,
            otpSuccessRate: 98.5
        };

        res.status(200).json({ success: true, stats: mockStats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
