import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //
    // ① S3（フロント用バケット）
    //
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      versioned: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Publicアクセス禁止
    });

    //
    // ② CloudFront (OAC で S3 を配信)
    //
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');
    frontendBucket.grantRead(originAccessIdentity);

    const distribution = new cloudfront.Distribution(this, 'CFDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });
    
    //
    // ③ VPC（Public / Private サブネット付き）
    //
    const vpc = new ec2.Vpc(this, 'TodoVpc', {
      maxAzs: 2, // 2つのAZに分散
      natGateways: 1,
    });

    //
    // ④ ECS クラスター（バックエンド用）
    //
    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc: vpc,
    });

    //
    // ⑤ Secrets Manager（DB認証情報を自動生成）
    //
    const dbSecret = new secretsmanager.Secret(this, 'DBSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
    });

    //
    // ⑥ RDS (Postgres, プライベートサブネット配置)
    //
    const dbInstance = new rds.DatabaseInstance(this, 'PostgresDB', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_7,
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      credentials: rds.Credentials.fromSecret(dbSecret),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      publiclyAccessible: false,
    });

    //
    // 出力値（あとでフロント/バックデプロイで使えるように）
    //
    new cdk.CfnOutput(this, 'CloudFrontDomain', {
      value: distribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, 'S3BucketName', {
      value: frontendBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
    });
    new cdk.CfnOutput(this, 'DBSecretName', {
      value: dbSecret.secretName,
    });
  }
}
