import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Clock, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

interface PredictionResult {
  id: string;
  user_id: string;
  age: number;
  gender: string;
  total_score: number;
  risk_level: string;
  confidence: number;
  risk_percentage: number;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

export default function AdminPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user profiles',
        variant: 'destructive',
      });
    } else {
      setProfiles((data || []) as Profile[]);
    }
  };

  const fetchPredictions = async () => {
    const { data, error } = await supabase
      .from('prediction_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Prediction fetch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch prediction history',
        variant: 'destructive',
      });
      return;
    }

    // Fetch profiles separately and merge
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, email, full_name');

    const profilesMap = new Map(
      profilesData?.map(p => [p.id, { email: p.email, full_name: p.full_name }]) || []
    );

    const predictionsWithProfiles = (data || []).map(pred => ({
      ...pred,
      profiles: profilesMap.get(pred.user_id) || { email: 'Unknown', full_name: null }
    }));

    setPredictions(predictionsWithProfiles as PredictionResult[]);
  };

  useEffect(() => {
    fetchProfiles();
    fetchPredictions();

    // Subscribe to real-time changes
    const profilesChannel = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchProfiles();
        }
      )
      .subscribe();

    const predictionsChannel = supabase
      .channel('predictions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prediction_results',
        },
        () => {
          fetchPredictions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(predictionsChannel);
    };
  }, []);

  const handleApprove = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve user',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'User approved successfully',
      });
      fetchProfiles();
    }
  };

  const handleReject = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        approval_status: 'rejected',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject user',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'User rejected',
      });
      fetchProfiles();
    }
  };

  const filteredProfiles = profiles.filter(
    (profile) => filter === 'all' || profile.approval_status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return <Badge className="bg-green-500">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const stats = {
    totalUsers: profiles.length,
    pendingUsers: profiles.filter(p => p.approval_status === 'pending').length,
    totalPredictions: predictions.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage user access and approvals</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => signOut()}>
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPredictions}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Review and approve user access requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({profiles.length})</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({profiles.filter(p => p.approval_status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({profiles.filter(p => p.approval_status === 'approved').length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({profiles.filter(p => p.approval_status === 'rejected').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProfiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">
                              {profile.full_name || 'N/A'}
                            </TableCell>
                            <TableCell>{profile.email}</TableCell>
                            <TableCell>
                              {new Date(profile.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(profile.approval_status)}</TableCell>
                            <TableCell>
                              {profile.approval_status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(profile.id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(profile.id)}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {profile.approval_status === 'rejected' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(profile.id)}
                                >
                                  Approve
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prediction History</CardTitle>
            <CardDescription>
              View all autism screening predictions from users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Risk %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No predictions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    predictions.map((prediction) => (
                      <TableRow key={prediction.id}>
                        <TableCell>
                          {new Date(prediction.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{prediction.profiles.full_name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{prediction.profiles.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{prediction.age}</TableCell>
                        <TableCell className="capitalize">{prediction.gender}</TableCell>
                        <TableCell>{prediction.total_score}</TableCell>
                        <TableCell>{getRiskBadge(prediction.risk_level)}</TableCell>
                        <TableCell>{(prediction.confidence * 100).toFixed(1)}%</TableCell>
                        <TableCell>{prediction.risk_percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
