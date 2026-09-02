export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'healthy',
    app: 'NAYRA Personal Command Center',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}
