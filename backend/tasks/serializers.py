from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        # どのモデルを変換するか
        model = Task 
        # フィールド = データ項目　　models.py に書く変数が 「フィールド」
        fields = ['id', 'title', 'completed']