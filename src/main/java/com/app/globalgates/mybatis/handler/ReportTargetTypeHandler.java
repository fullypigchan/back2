package com.app.globalgates.mybatis.handler;

import com.app.globalgates.common.enumeration.ReportTargetType;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.*;

@MappedTypes(ReportTargetType.class)
public class ReportTargetTypeHandler implements TypeHandler<ReportTargetType> {
    @Override
    public void setParameter(PreparedStatement ps, int i, ReportTargetType parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter.getValue(), Types.OTHER);
    }

    @Override
    public ReportTargetType getResult(ResultSet rs, int columnIndex) throws SQLException {
        return ReportTargetType.getReportTargetType(rs.getString(columnIndex));
    }

    @Override
    public ReportTargetType getResult(ResultSet rs, String columnName) throws SQLException {
        return ReportTargetType.getReportTargetType(rs.getString(columnName));
    }

    @Override
    public ReportTargetType getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return ReportTargetType.getReportTargetType(cs.getString(columnIndex));
    }
}
